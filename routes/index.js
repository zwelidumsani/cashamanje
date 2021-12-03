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
var id;
var propertyId;
var searchedProperties = [];
var ticket;
var ticketId;
var user;
var searchProperties;


const accountSid = 'AC3c506767f08d7269912cf174bce0b68d'; 
const authToken = '896a17370c28d4a7c7472ea01d119b6f'; 
const client = require('twilio')(accountSid, authToken);


const options = {
  page: 1,
  limit: 2,
  collation: {
    locale: 'en',
  },
};

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
					 status: "Pending...",
					 myClass: "label-danger",
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

router.get('/', paginatedApprovedResults(Property),  function(req, res, next){
	 if (searchProperties){
		      var properties = req.session.imiphumela;
			  searchProperties = null;
			  req.session.imiphumela = null;
		      return res.render("index", {csrfToken: req.csrfToken(), properties: properties});
	 }else {
	          return res.render("index", {csrfToken: req.csrfToken(), properties: res.paginatedResults});
	 }
});



router.get('/get-id/:id', function (req, res, next){
	  proId = req.params.id;
	  res.redirect('/property-details');
})


router.get('/property-details', (req, res, next) => {
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
    

/*router.get('/', (req, res) => {
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
*/



router.post('/search-properties', paginatedSearchedResults(Property),  function(req, res, next){
	  searchProperties = 1;
	  req.session.imiphumela = res.paginatedResults; 
	  res.redirect('/');
});


/*	
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
				 status:req.body.status,
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

*/
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
					 myClass:"label-danger",
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



//DASHBOARD START =====================================================================================================
router.get('/user-properties', isLoggedIn, paginatedUserResults(Property),  function(req, res, next){
	  user = 1;
      res.render('dashboard', {layout: "dash.handlebars", admin: "USER", properties: res.paginatedResults, user:user});
})


router.get('/all-properties', isLoggedIn, paginatedResults(Property),  function(req, res, next){
	var proRemoval = req.flash("pro_removal")[0];
	var user;
	if(req.user.email == '78127625' ){
		 return res.render('dashboard', {layout: "dash.handlebars", admin: "ADMIN", properties: res.paginatedResults, proRemoval: proRemoval});
	}else {
		 res.redirect("/user-properties")
	}
});


router.get('/dashboard', isLoggedIn, function(req, res, next){
	propertyId = null;
	var home;
	if(req.user.email == '78127625' ){
		
	     res.render('dashboard',{layout: "dash.handlebars"});
		
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


router.get('/dashboard-get-property-id/:id', (req, res) => {
     proId = req.params.id;
     res.redirect('/dashboard-get-property');	
});


router.get('/dashboard-get-property', isLoggedIn, function(req, res, next){
	var proUpdate = req.flash("pro_update")[0];
     Property.findById(proId, function(err, property){
		if(err){
			console.log("Error finding property Info", err.message);
		}
		if(!property){
			console.log("Property unavailable");
			return res.redirect('/');
		}else { 
				User.findById(property.user._id, function(err, user){
					if(err){
						 console.log("User not found ",err.message);
					}else {
					   return res.render("property_info", {csrfToken: req.csrfToken(), layout: "dash.handlebars", property: property, user:user,
					   proUpdate: proUpdate});
				}
			})
		}
	});	
});




//UPDATE------------------------------------------------
router.post('/property-update', isLoggedIn, function(req, res, next){
	 Property.findByIdAndUpdate(proId, {
		 price: req.body.price,
		 propertyName: req.body.propertyname,
		 propertyStructure: req.body.propertystructure,
		 cityName: req.body.cityname,
		 communityName: req.body.communityname,
		 region: req.body.region,
		 status: req.body.status,
		 myClass: req.body.myclass,
		 landLordCell: req.body.landloardcell,
		 availableRooms: req.body.availablerooms
		
		}, function(err, docs) {
			 
		if (err){
			console.log("Error updating: ", err)
		}
		else{
			console.log("Property Updated:");
			req.flash("pro_update", "Property updated");
			res.redirect('/dashboard-get-property');
		}
    });
});


/*if(order.status == "Closed"){
				 Order.findOneAndRemove()
	             .then(data => {
		         req.flash('order_success_delete', 'An order has been processed and removed');
		         return res.redirect('/dashboard');
	           })

*/
//END DASHBOARD ===========================================================================================================================
router.get('/remove-property', isLoggedIn, function(req, res, next){ 
				 Property.remove({_id: proId}, function(err, docs){
					 if(err){
						 console.log("Could not remove property! ",err.message);
					 }else {
						 console.log("Property removed successfully.");
						 req.flash('pro_removal', 'Property removed successfully.');
						 res.redirect('/all-properties');
					 }
			});
});


router.get('/ticket-id/:id', (req, res) => {
     ticketId = req.params.id;
     res.redirect('/view-ticket');	
});

router.get('/all-tickets', isLoggedIn, function(req, res, next){
	  var tRemoval = req.flash("t_removal")[0];
     if(req.user.email == '78127625' ){
		
	    Ticket.find(function(err, tickets){		
			if (err){
					 return res.write('Error: '+ "Could not find tickets");
			} else {
				return res.render('tickets', {layout: "dash.handlebars", admin: "ADMIN", tickets: tickets, tRemoval: tRemoval});
			}
		});
	 }	
});

router.get('/view-ticket', isLoggedIn, function(req, res, next){
	var tUpdate = req.flash("t_update")[0];
     Ticket.findById(ticketId, function(err, ticket){
		if(err){
			console.log("Error finding ticket Info", err.message);
		}
		if(!ticket){
			console.log("ticket unavailable");
			return res.redirect('/');
		}else { 
		        Property.findById(ticket.property, function(err, property){
					 if(err){
						 console.log("Err finding a property: ", err.message);
					 }else {
						     User.findById(property.user, function(err, user){
								 if(err){
									 console.log("Could not find user: ", err.message);
								 }else {
									 
									 return res.render("ticket_info",{csrfToken: req.csrfToken(), layout: "dash.handlebars", ticket:ticket, property:property, user:user, tUpdate: tUpdate});
								 } 
							 })
						     
					 }
				})
			   	
		}
	});
});



router.post('/update-ticket', isLoggedIn, function(req, res, next){
	var localTime = new Date();
	 Ticket.findByIdAndUpdate(ticketId, {
		 clientName: req.body.clientname,
		 clientSurname: req.body.clientsurname,
		 clientCell: req.body.clientcell,
		 createdAt: localTime.toLocaleString() 
		}, function(err, docs) {
			 
		if (err){
			console.log("Error updating ticket: ", err.message)
		}
		else{
			console.log("Ticket Updated:");
			req.flash("t_update", "Ticket updated");
			res.redirect('/view-ticket');
		}
    });
});


router.get('/remove-ticket', isLoggedIn, function(req, res, next){ 
	Ticket.findById(ticketId, function(err, ticket){
		if(err){
			console.log("Could not remove ticket! ",err.message);
		}else {
			console.log("TICKET ID: ", ticket._id);
			Property.findById(ticket.property, function(err, property){
			if (err){
				console.log("Could'nt find Property: ", err.message);
			}else {
				Property.findOneAndUpdate({_id: ticket.property}, {availableRooms: property.availableRooms-1}, {new: false}, function(err, property){
					if(err){
							console.log("Update failed", err.message);
						}else{
							 console.log("Update successfull");
							 
							 Ticket.remove({_id: ticketId}, function(err, ticket){
								 if(err){
									 console.log("Could'nt locate ticket: ", err.message);
								 }else {
									  console.log("Ticket removed successfully:");
									  req.flash("t_Removal", "Ticket updated");
									  return res.redirect('/all-tickets');
								 }
							 })
							
					}
				})
			}
		 });	
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
	 if(req.user.email == '78127625'){
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
		if(req.user.email == '78127625'){
			 req.session.signupButton = 1;
			 console.log(req.session.signupButton); 
	    }
		res.redirect('/');
	}
);
	

router.get('/about', function(req, res){
	
		res.render('aboutUs.handlebars');
});

router.get('/properties', paginatedResults(Property), function(req, res, next){
	console.log(res.paginatedResults);
	 res.json(res.paginatedResults);
})

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

function paginatedResults(model){
	 return async (req, res, next) => {
			const page  = parseInt(req.query.page)
			const limit = 9;
			
			const startIndex = (page - 1) * limit;
			const endIndex = page * limit;

			const results = {}

			if (endIndex < await model.countDocuments().exec()) {
				results.next = {
					page: page,
					limit:limit
				}
			}

			if (startIndex > 0) {
				results.previous = {
					page: page - 1,
					limit:limit
				}
			}
			
			try {
				results.results = await model.find().limit(limit).skip(startIndex).exec()
				res.paginatedResults = results
				next()
				} catch(e) {
					 res.status(500).json({message: e.message})
			}	
	 }
}



function paginatedUserResults(model){
	 return async (req, res, next) => {
			const page  = parseInt(req.query.page)
			const limit = 9;
			
			const startIndex = (page - 1) * limit;
			const endIndex = page * limit;

			const results = {}

			if (endIndex < await model.countDocuments().exec()) {
				results.next = {
					page: page,
					limit:limit
				}
			}

			if (startIndex > 0) {
				results.previous = {
					page: page - 1,
					limit:limit
				}
			}
			
			try {
				results.results = await model.find({user: req.user}).limit(limit).skip(startIndex).exec()
				res.paginatedResults = results
				next()
				} catch(e) {
					 res.status(500).json({message: e.message})
			}	
	 }
}


//===========Approved status==========================================================================
function paginatedApprovedResults(model){
	 return async (req, res, next) => {
			const page  = parseInt(req.query.page)
			const limit = 9;
			
			const startIndex = (page - 1) * limit;
			const endIndex = page * limit;

			const results = {}

			if (endIndex < await model.countDocuments().exec()) {
				results.next = {
					page: page,
					limit:limit
				}
			}

			if (startIndex > 0) {
				results.previous = {
					page: page - 1,
					limit:limit
				}
			}
			
			try {
				results.results = await model.find({status: "Approved"}).limit(limit).skip(startIndex).exec()
				res.paginatedResults = results
				next()
				} catch(e) {
					 res.status(500).json({message: e.message})
			}	
	 }
}

//===========searched properties======================================================
function paginatedSearchedResults(model){
	 return async (req, res, next) => {
			const page  = parseInt(req.query.page)
			const limit = 9;
			
			const startIndex = (page - 1) * limit;
			const endIndex = page * limit;

			const results = {}

			if (endIndex < await model.countDocuments().exec()) {
				results.next = {
					page: page,
					limit:limit
				}
			}

			if (startIndex > 0) {
				results.previous = {
					page: page - 1,
					limit:limit
				}
			}
			
			try {
				if(req.body.region == "" || req.body.cityname == "" || req.body.communityname == ""){
		              return res.redirect("/");
	            }
				results.results = await model.find({status:"Approved",region: req.body.region, cityName: req.body.cityname, communityName: req.body.communityname}).limit(limit).skip(startIndex).exec()
				res.paginatedResults = results
				next()
				} catch(e) {
					 res.status(500).json({message: e.message})
			}	
	 }
}

	
	  

module.exports = router;  
