import  express from "express";
import {verifyJWT} from "../middlewares/auth.js"
import {bookAppointment,getAppointmentByMerchant,getAppointmentsByUser,updateAppointmentStatus,cancelAppointment} from "../controllers/appointment.js";
const router = express.Router();



router.post("/book",bookAppointment);
router.put("/:appointmentId/status",updateAppointmentStatus);
router.get("/user/:userId",getAppointmentsByUser)
router.get("/merchant/:merchantId",getAppointmentByMerchant);
router.delete("/:appointmentId",cancelAppointment)






export default router;