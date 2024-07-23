import  express from "express";
import {verifyJWT} from "../middlewares/auth.js"
import {createNewMerchantAccount, loginMerchant, logOutMerchant, refreshAccessToken, updateMerchantDetails, getMerchantDetails} from "../controllers/merchant.js";
const router = express.Router();



router.post("/signup",createNewMerchantAccount);
router.post("/login",loginMerchant);
router.post("/logout",verifyJWT,logOutMerchant)
router.post("/refreshtoken",refreshAccessToken);
router.put('/update/:id', updateMerchantDetails);
router.get('/:id', getMerchantDetails);






export default router;