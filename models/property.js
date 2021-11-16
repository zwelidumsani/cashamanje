var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var schema = new Schema({
	 user:{type: Schema.Types.ObjectId, ref: 'User'},
	 propertyImagePath:{type: String, required: true,trim: true},
	 price:{type: String, required: true, trim: true},
	 propertyName:{type: String, required: true,trim: true},
	 propertyStructure:{type: String, required: true,trim: true},
	 cityName:{type: String, required: true, trim: true},
	 communityName:{type: String, required: true, trim: true},
	 region: {type: String, required: true, trim: true},
	 landlordCell:{type: String, required: true, trim: true},
	 availableRooms:{type: String, required: true, trim: true},
	 publication:{type: String, required: true, trim: true},
	 status: {type: String, required: true, trim: true},
	 createdAt:{type: String, required: true, trim: true}
});

module.exports = mongoose.model('Property', schema);
 
