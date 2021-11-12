var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var schema = new Schema({
	 user:{type: Schema.Types.ObjectId, ref: 'User'},
	 cart:{type: Object, required: true},
	 name:{type: String, required: true, trim: true},
	 address: {type: String, required: true, trim: true},
	 phone: {type: String, required: true, trim: true}, 
	 country: {type: String, required: true, trim: true},
	 statusCss: {type: String, required: true, trim: true},
     status: {type: String, required: true, trim: true},
	 createdAt: {type: String, required: true, trim: true}
     	
});

module.exports = mongoose.model('Order', schema);