import mongoose ,{ Schema, SchemaType } from "mongoose";

const appointmentSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    merchant: {
      type: Schema.Types.ObjectId,
      ref: "Merchant",
    },
    service:{
       type:Schema.Types.ObjectId,
       ref:"Service",
       required:true
    },
    date: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    time:{
      type:Number
    }
  },
  {
    timestamps: true,
  }
);

const Appointment = mongoose.model("Appointment", appointmentSchema);

export default Appointment;
