var mongoose = require('mongoose');
var Schema = mongoose.Schema;
const mongoosePaginate = require('mongoose-paginate-v2');

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
	 myClass:{type: String, required: true, trim: true},
	 status: {type: String, required: true, trim: true},
	 createdAt:{type: String, required: true, trim: true}
});

schema.plugin(mongoosePaginate);
module.exports = mongoose.model('Property', schema);
 
