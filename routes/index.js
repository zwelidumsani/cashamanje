var nodemailer = require('nodemailer');
const path = require('path');
const express = require('express')
const router = express.Router()
const multer = require("multer");
var Cart = require('../models/cart.js');
var Product = require('../models/product')
var Property = require('../models/property')
var Ticket = require('../models/ticket')
var lib = require('../lib/library')
var Order = require('../models/order')
var User = require('../models/user')
var passport = require('passport');
var clientOrder = {};
var proId;
var propertyId;
var searchedProperties = [];



const accountSid = 'AC3c506767f08d7269912cf174bce0b68d'; 
const authToken = '896a17370c28d4a7c7472ea01d119b6f'; 
const client = require('twilio')(accountSid, authToken);

//Multer storage
const storage = multer.diskStorage({
	destination: 'images',
	filename: function(req, file, cb){
		 cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
	}
});

const upload = multer({
	storage: storage
}).single('image');



router.get('/submit',isLoggedIn, function(req, res, next){ErrorSavingPropertyImage
     propertyId = null;
     var propertySaved = req.flash("propertySaved")[0];
	 var errorSavingProperty = req.flash("errorSavingProperty")[0];
	 var ErrorSavingPropertyImage = req.flash("ErrorSavingPropertyImage")[0];
	
	 res.render('submit',{csrfToken: req.csrfToken(),propertySaved:propertySaved, errorSavingProperty:
     errorSavingProperty, ErrorSavingPropertyImage:ErrorSavingPropertyImage});
});


router.post('/submit', isLoggedIn, function(req, res){
	 upload(req, res, (err) => {
			 if (err){
				 console.log(err);
				 req.flash('ErrorSavingPropertyImage', 'Error saving property image!')
				 
			 } else {
				 var localTime = new Date();
				 
				 newProperty = new Property({
					 user: req.user,
					 propertyName: req.body.propertyName,
					 propertyStructure: req.body.propertyStructure,
					 cityName: req.body.cityName,
					 communityName: req.body.communityName, 
					 price:req.body.price,
					 landlordCell: req.body.landlordCell,
					 region: req.body.region,
					 availableRooms: req.body.availableRooms,
					 propertyImagePath: req.file.path.slice(7.0),
					 status: "label-danger",
					 publication:"Publish",
					 createdAt: localTime.toLocaleString()
	            });
				
				newProperty.save(function(err, doc){
					if(err){
						 req.flash('errorSavingProperty', 'Error saving property!')
						 console.log("Could not save property",err.message);
					}else {
						 req.flash('propertySaved', 'Property saved successfully.');
						 res.redirect('/submit'); 
					}
				}); 
			 }
		 });	   	
});

    

router.get('/', (req, res) => {
	 var ifSearchedProperties;
	
	 propertyId = null;
	 if (searchedProperties.length == 0){
		  var propertiesArray = [];
         Property.find({status: 'Approved'}, function(err, properties){	
	     properties.forEach(function(property){
			 var propertyObject = {
				 propertyId: property._id,
				 propertyName:property.propertyName,
				 cityName: property.cityName,
				 price:property.price,
				 town: property.communityName,
				 propertyStructure: property.propertyStructure,
				 availableRooms: property.availableRooms,
				 propertyImagePath: property.propertyImagePath,
				 communityName:property.communityName
			}
			propertiesArray.push(propertyObject);			
		 });
		 
		     return res.render('index', {properties: propertiesArray, csrfToken: req.csrfToken()});
	     });	
		 
	 }else { 
	 	     var propertiesArray = [];
		     Property.find({status: 'Approved'}, function(err, properties){	
	             properties.forEach(function(property){
			     var propertyObject = {
				 propertyId: property._id,
				 propertyName:property.propertyName,
				 cityName: property.cityName,
				 price:property.price,
				 town: property.communityName,
				 propertyStructure: property.propertyStructure,
				 availableRooms: property.availableRooms,
				 propertyImagePath: property.propertyImagePath,
				 communityName:property.communityName
			}
			 propertiesArray.push(propertyObject);			
		 });
	         console.log("Do you go here??");
			  var ifSearchedProperties = 1;
			  var anotherArray = Array.from(searchedProperties);
			  searchedProperties = [];
		      return res.render('index', {csrfToken: req.csrfToken(), properties: propertiesArray, yourProperties: anotherArray, ifSearchedProperties:ifSearchedProperties});
		})
	 }
});


router.post('/search-properties', (req, res) => {
	if(req.body.region == "" || req.body.cityname == "" || req.body.communityname == ""){
		return res.redirect("/");
	}
	     Property.find({region: req.body.region, cityName: req.body.cityname, communityName: req.body.communityname}, function(err, properties){
		     if (err){
				 console.log("Could not find searched properties: "+ err.message);
			 }else {
				 properties.forEach(function(property){
			     var propertyObject = {
				 propertyId: property._id,
				 propertyName:property.propertyName,
				 cityName: property.cityName,
				 price:property.price,
				 town: property.communityName,
				 propertyStructure: property.propertyStructure,
				 availableRooms: property.availableRooms,
				 propertyImagePath: property.propertyImagePath,
				 communityName:property.communityName
			    }
			      searchedProperties.push(propertyObject);			
		         });
		          console.log("Are you running??")
		          return res.redirect('/');
			}
	  });	
});


router.get('/logout', isLoggedIn, function(req, res, next){
		req.logout();
		req.session.signupButton = null;
		res.redirect('/signin');
	});


router.get('/get-property-id/:id', function(req, res, next){
	 propertyId = req.params.id;
	 console.log(propertyId);
	 res.redirect('/create-ticket');
});



router.get('/create-ticket', function(req, res, next){
	var ticketSaved;
	var errorSavingTicket;
	
	errorSavingTicket = req.flash("errorSavingTicket")[0];
	ticketSaved = req.flash("ticketSaved")[0];
	res.render('ticket', {csrfToken: req.csrfToken(),errorSavingTicket: errorSavingTicket, ticketSaved: ticketSaved});	
});



router.post('/ticket', function(req, res, next){
	Property.findById(propertyId, function(err, property){
		if(err)
		{console.log("Error finding property", err.message);}
	
		if(!property){
			console.log("Property unavailable");
			 return res.redirect('/');
		}else { 
			 	 var localTime = new Date();
				 
				 newTicket = new Ticket({
					 property: property,
					 clientName: req.body.name,
					 clientSurname: req.body.surname,
					 clientCell: req.body.phonenumber,
					 status: "Pending...",
					 createdAt: localTime.toLocaleString()
	             });
					
				 newTicket.save(function(err, doc){
					if(err){
						 req.flash('errorSavingTicket', 'Error saving ticket!')
						 console.log("Could not save ticket",err.message);
					}else {
						 propertyId = null;
						 req.flash('ticketSaved', 'Ticket saved successfully.');
						 res.redirect('/create-ticket'); 
				    }
	         });
		 }
	 });	
});



router.get('/get-id/:id', (req, res) => {
     proId = req.params.id;
     res.redirect('/property-details');	
});


router.get('/property-details', (req, res) => {
	propertyId = null;
	Property.findById(proId, function(err, property){
		if(err){console.log("Error finding property Info", err.message);}
		if(!property){
			console.log("Property unavailable");
			return res.redirect('/');
		}else { 
			 return res.render("property", {property: property});
		}
	});	
});



router.get('/dashboard', isLoggedIn, function(req, res, next){
	propertyId = null;
	
	if(req.user.email == 'zwelidumsani@gmail.com' ){
		
		Property.find(function(err, properties){		
			if (err){
					 return res.write('Error: '+ "Could not find properties");
			}
			
				 res.render('dashboard',{properties: properties, admin:"ADMIN"});
			});
	
	
    }else {
    Order.find({user: req.user}, function(err, orders){	
	userid = 'Admin@admin.admin';
	if (err){
		return res.write('Error');
		}
	var cart;
	var totalProducts = 0;
	orders.forEach(function(order){
	cart = new Cart(order.cart);
	
	order.items = cart.generateArray();
	totalProducts = totalProducts + order.cart.totalQty;
	});
	     res.render('dashboard', {idd: userid,admin:"USER", idd: !userid, id:req.user._id, email:req.user.email, orders: orders, totalOrders: !orders.length, totalOrders: orders.length, totalProducts:  totalProducts,  headin: "ACCOUNT AND ORDERS"});
    });
	}	
});


router.get('/remove-account', isLoggedIn, function(req, res, next){ 
	
		 Order.deleteMany({user: req.user}, function(err){
			 if(err){
				 console.log("Could not delete Orders.");
			 } else {
				 User.findOneAndRemove({_id: req.user}, function(err,docs){
					 if(err){
						 console.log("Could not remove User!");
					 }else {
						 console.log("Account removed successfully.");
						 req.flash('acc-removal', 'You have successfully Deleted your account.');
						 res.redirect('/');
					 }
				 });
			 }
		 });
});



router.get('/remove-order/:id', isLoggedIn, function(req, res, next){
	var orderId = req.params.id;
	console.log(orderId);
	Order.findById(orderId, function(err, order){
		if(err){
			console.log("Could not find Order", err.message);
		}else {
			if(order.status == "Closed"){
				 Order.findOneAndRemove()
	             .then(data => {
		         req.flash('order_success_delete', 'An order has been processed and removed');
		         return res.redirect('/dashboard');
	           })
	             .catch(err => {
		             return res.json({
			         confirmation: 'fail',
			         message:err.message
		            });
	            })
			}else {
				 req.flash('error-removing-order', 'Order Error');
				 return res.redirect("/dashboard");
			}
		}
	});
		
});


router.get('/close-order/:id', isLoggedIn, function(req, res, next){
	 var orderId = req.params.id;
	 Order.findOneAndUpdate({_id: orderId}, {statusCss: "label", status:"Closed"}, {new: false}, function(err, update){
		 if(err){
			 console.log("Update failed", err.message);
		 }else{
			 console.log("Order has been closed.");
			 return res.redirect('/dashboard');
		 }
	 });
});





router.get('/contact', function(req, res){
		propertyId = null;
		var emailSuccess = req.flash("email_success")[0];
		var emailError = req.flash("email_error")[0];
		res.render('contactUs', {csrfToken: req.csrfToken(), emailError: emailError, emailSuccess: emailSuccess, headin: "SEND US A MESSAGE"});
});	


router.post('/email', function(req, res){
	
	var transporter = nodemailer.createTransport({
		
	 service: 'Gmail',
	    auth: {
		     user: 'eswatiniherbalnutrition@gmail.com',
		     pass: 'FANAdumsani@1989367'
		}
	});
	
    const mailOptions = {
         from: req.body.email, // sender address
         to: 'eswatiniherbalnutrition@gmail.com', // list of receivers
         subject: 'Client Mail', // Subject line
         html: '<p>'+req.body.message+'</p>'// plain text body
    };

	transporter.sendMail(mailOptions, function (err, info) {
		if(err){ 
		     console.log("Error sending email", err.message);
		     req.flash("email_error", "Something went wrong");	
		     return res.redirect('/contact');
		}else{
		     console.log("Email has been sent");
		     req.flash("email_success", "Email sent successfully");			 
		     console.log(info);
		     return res.redirect('/contact'); 
		}
    });
});



router.get('/add-to-cart/:id', function(req, res,){
	
		 var productId = req.params.id;
	     var cart = new Cart(req.session.cart ? req.session.cart: {});
			
		 Product.findById(productId, function(err, product){
			if (err){
			   return res.redirect('/');
			}
			cart.add(product, product.id);
			req.session.cart = cart;
			var listingUrl = req.session.listingUrl;
			req.session.listingUrl = null;
			return res.redirect(listingUrl);  
	    });

});



router.get('/remove/:id', function(req, res, next){
			var productId = req.params.id;
			var cart = new Cart(req.session.cart ? req.session.cart: {})
			
			cart.removeItem(productId);
			req.session.cart = cart;
			res.redirect('/shopping-cart');
});


router.get('/signup', isLoggedIn, function(req, res, next){
	 if(req.user.email == 'zwelidumsani@gmail.com'){
		 var messages = req.flash('error');
         res.render('signup', {csrfToken: req.csrfToken(),messages: messages, hasErrors: messages.length > 0});
	 } else {
		 res.redirect('/');
	 } 
});

 
router.post('/signup',passport.authenticate('strategy', {
	 failureRedirect:'/signup',
	 failureFlash: true
    }), function(req, res,next){
		req.session.sessionUser = req.user
		if(req.session.oldUrl){
			 var oldUrl = req.session.oldUrl
			 req.session.oldUrl = null;
			 res.redirect(oldUrl);
		}else {
			res.redirect('/');
		}
	}   
);



router.get('/signin', function(req, res, next){
	 propertyId = null;
	 var messages = req.flash('error');
     res.render('loginn.handlebars',{csrfToken: req.csrfToken(), messages: messages, hasErrors: messages.length > 0});
});

router.post('/signin',passport.authenticate('local', {
	 failureRedirect:'/signin',
	 failureFlash: true
    }), function(req, res, next){
		if(req.user.email == 'zwelidumsani@gmail.com'){
			 req.session.signupButton = 1;
			 console.log(req.session.signupButton); 
	    }
		res.redirect('/');
	}
);
	

router.get('/about', function(req, res){
	
		res.render('aboutUs.handlebars');
});

function isLoggedIn (req, res, next){
   if (req.isAuthenticated()) {
	   return next();
   }
     req.session.oldUrl = req.url; ///checkout
     res.redirect('/signin');
}

function isNotLoggedIn (req, res, next){
   if (!req.isAuthenticated()) {
	   return next();
   }
   res.redirect('/');
}



module.exports = router;
