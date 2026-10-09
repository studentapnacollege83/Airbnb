const { ObjectId } = require("mongodb");
const mongoose=require('mongoose')
const User = require("./user");


const homeSchema=mongoose.Schema({
  houseName:{type:String,required:true},
  price:{type:Number,required:true},
  location:{type:String,required:true},
  rating:{type:String,required:true},
  photo:String,
  description:String,
})

homeSchema.statics.deleteById = function (homeId) {
  return this.findByIdAndDelete(homeId);
};
homeSchema.pre('findByIdAndDelete',async function(next){
  const homeId=this.getQuery()._id
  await User.updateMany({}, { $pull: { favourites: homeId } });
  next()
})
module.exports=mongoose.model('Home',homeSchema)








/**
  * save()
    find()
    findById(homeId)
     deleteById(homeId)
 */
