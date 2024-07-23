import mongoose ,{ Schema } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const merchantSchema = new Schema(
  {
    username:{
      type:String,
      required:true
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
    },
    address: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    shopname:{
       type:String,
       required:true
    },
    services:[
      {
        type:Schema.Types.ObjectId,
        ref:"Service"
      }
    ],
    appointments: [
      { type: Schema.Types.ObjectId,
       ref: 'Appointment' 
      }
      ],
   

    
  },
  {
    timestamps: true,
  }
);
merchantSchema.pre("save",  async function(next){
  if(!this.isModified("password")) return next();

  this.password =  await bcrypt.hash(this.password, 10)
  next()
})

merchantSchema.methods.isPasswordCorrect = async function(password){
    return await bcrypt.compare(password, this.password);
}

merchantSchema.methods.generateAccessToken = function(){
  return jwt.sign(
     {
        _id : this._id,
        email:this.email,
        name: this.name
     },
     process.env.ACCESS_TOKEN_SECRET,
     {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRY
     }
  )
}


merchantSchema.methods.generateRefreshToken = function(){
  return jwt.sign(
     {
        _id : this._id
        
     },
     process.env.REFRESH_TOKEN_SECRET,
     {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRY
     }
  )
}

const Merchant = mongoose.model("Merchant", merchantSchema);

export default Merchant;
