import mongoose , {Schema} from "mongoose";

const serviceSchema =  new Schema({
    name:{
        type:String,
        required:true
    },
    description:{
        type:String,
        
    },
    price:{
        type:Number,
        required:true
    },
    merchant:{
        type:Schema.Types.ObjectId,
        ref:"Merchant"
    },
    availableslots:[{
        type:String,
        required:true
    }]
    
},{timestamps:true})



 const Service = mongoose.model("Service",serviceSchema)

 export default Service