var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var schema = new Schema({
	 property:{type: Schema.Types.ObjectId, ref: 'Property'},
	 clientName: {type: String, required: true, trim: true},
	 clientSurname: {type: String, required: true, trim: true},
	 clientCell: {type: String, required: true, trim: true}, 
     status: {type: String, required: true, trim: true},
	 createdAt: {type: String, required: true, trim: true}  	
});

module.exports = mongoose.model('Ticket', schema);

