var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var schema = new Schema({
	imagePath:{type: String, required: true,trim: true},
	propertyName:{type: String, required: true,trim: true},
	title:{type: String, required: true, trim: true},
	solution:{type: String, required: true, trim: true},
	description:{type: String, required: true, trim: true},
	summary:{type: String, required: true, trim: true},
	price:{type: Number, required: true, trim: true},
	instructions:{type: String, required: true, trim: true},
	testimonials:{type: String, required: true, trim: true},
	volume:{type: String, required: true, trim: true},
});

module.exports = mongoose.model('Product', schema);
 
