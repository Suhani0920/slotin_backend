import express from "express";
import cookieParser from "cookie-parser";
import router from"../slotin_backend/src/routes/user.js"
import appointmentRoutes from "../slotin_backend/src/routes/appointment.js"
import merchantRoutes from "../slotin_backend/src/routes/merchant.js"
const app = express();
app.use(express.urlencoded({extended:false}));
app.use(express.json());
app.use(cookieParser())

app.use("/user",router);
app.use("/appointments",appointmentRoutes);
app.use("/merchant",merchantRoutes);
export { app }