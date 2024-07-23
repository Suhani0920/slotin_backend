import Appointment from "../module/appointment.js";
import Merchant from "../module/merchant.js";
import Service from "../module/service.js";
import User from "../module/user.js";

const bookAppointment = async(req,res)=>{
    try {
        const {userId , merchantId,serviceId,date,slot} = req.body;
        const service = await Service.findbyId(serviceId);
        if(!service){
            return res.status(404).json({message:"Service not found"});
    
        }
        const merchant = await Merchant.findbyId(merchantId);
        if(!merchant){
            return res.status(404).json({message:"Service provider not found"});
        }
    
        if(!service.availableslots.includes(slot)){
            return res.status(404).json({message:"Slot not available"});
        }
    
        const appointment = new Appointment({
            user :userId,
            merchant : merchantId,
            service : serviceId,
            date,
            slot,
            status:"Pending"
        });
    
        await appointment.save();
        Merchant.appointments.push(appointment._id);
        await Merchant.save(); 

        const user = await User.findById(userId);
        user.appointments.push(appointment._id);
        await user.save();
        res.status(201).json({message:"Slot booked successfully",appointment});
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}



//get appointment for specific mechant

const getAppointmentByMerchant = async(req,res)=>{
    try {
        const {merchantId} = req.params;
    
        const appointments = await(Appointment.find({Merchant:merchantId})).populate('user','name').populate('service','name','price');
        res.status(200).json(appointments);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }

}

//get appointment for specific user
const getAppointmentsByUser = async (req, res) => {
    const { userId } = req.params;

    try {
        const appointments = await Appointment.find({ user: userId })
            .populate('merchant', 'shopname  address')  
            .populate('service', 'name description price');  

        res.status(200).json(appointments);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}


//update appointment status

const updateAppointmentStatus = async(req,res)=>{
    const { appointmentId } = req.params;
    const { status } = req.body;

    try {
        const appointment = await Appointment.findById(appointmentId);
        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found' });
        }

        appointment.status = status;
        await appointment.save();

        res.status(200).json({ message: 'Appointment status updated', appointment });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

//cancel appointment


const cancelAppointment = async (req, res) => {
    const { appointmentId } = req.params;

    try {
        const appointment = await Appointment.findById(appointmentId);
        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found' });
        }

        await appointment.remove();

        res.status(200).json({ message: 'Appointment canceled' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}


export {bookAppointment,getAppointmentByMerchant,getAppointmentsByUser,updateAppointmentStatus,cancelAppointment}