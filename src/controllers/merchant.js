import Merchant from"../module/merchant.js";
import validator from "validator";
import jwt from "jsonwebtoken";
const generateAccessAndRefreshTokens = async (merchantId) => {
    try {
        const merchant = await Merchant.findById(merchantId);
        const accessToken = merchant.generateAccessToken();
        const refreshToken = merchant.generateRefreshToken();
        merchant.refreshToken = refreshToken;

        await merchant.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };
    } catch (error) {
        throw new Error(error.message);
    }
};


const createNewMerchantAccount = async (req, res) => {
    const { username, name,  email,address,phone, password,shopname } = req.body;

    if (!validator.isEmail(email)) {
        return res.status(400).send("Invalid email format");
    }

    if (!validator.isLength(password, { min: 6, max: 10 })) {
        return res.status(400).send("Password must be between 6 and 10 characters");
    }
    if (!/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[0-9]/.test(password) || !/[!@#$%^&*]/.test(password)) {
        return res.status(400).send("Password must include uppercase, lowercase, number, and special character");
    }

    if (!/^[a-zA-Z0-9_]{3,15}$/.test(username)) {
        return res.status(400).send("Username must be 3-15 characters long and can only contain letters, numbers, and underscores");
    }

    if (!/^[a-zA-Z]+$/.test(name)) {
        return res.status(400).send("Name should contain only alphabetic characters");
    }

    if (!validator.matches(shopname, /^[a-zA-Z0-9\s]{3,50}$/)) {
        return res.status(400).send("Shopname must be 3-50 characters long and can only contain letters, numbers, and spaces");
    }

    
    if (!validator.isLength(address, { min: 10, max: 100 })) {
        return res.status(400).send("Address must be between 10 and 100 characters long");
    }

    
    const phoneRegex = /^(\+91[\s-]?)?[789]\d{9}$/;
    if (!phoneRegex.test(phone)) {
        return res.status(400).send("Phone number must be a valid Indian phone number");
    }

    try {
        const existingMerchant = await Merchant.findOne({ $or: [{ username }, { email }] });

        if (existingMerchant) {
            return res.status(409).send("Email or username already exists");
        }

        const newMerchant = await Merchant.create({
            username,
             name, 
              email,
              address,
              phone,
               password,
               shopname
        });

        const newResponse = await Merchant.findById(newMerchant.id).select("-password -refreshToken");

        if (!newResponse) {
            return res.status(500).send("Something went wrong while creating new merchant");
        }

        return res.status(201).send("Merchant created");
    } catch (error) {
        return res.status(500).send("Server error");
    }
};


const loginMerchant = async (req, res) => {
    const { email, username, password } = req.body;

    if (!(username || email)) {
        return res.status(401).send("Username or email required");
    }

    try {
        const merchant = await Merchant.findOne({ $or: [{ username }, { email }] });

        if (!merchant) return res.status(401).json({ message: "Merchant does not exist" });

        const isPasswordValid = await merchant.isPasswordCorrect(password);

        if (!isPasswordValid) return res.status(401).json({ message: "Incorrect password" });

        const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(merchant._id);

        const loggedInMerchant = await Merchant.findById(merchant._id).select("-password -refreshToken");

        const options = {
            httpOnly: true,
            secure: true
        };

        res.status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", refreshToken, options)
            .json({ msg: "Merchant logged in successfully" });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};


const logOutMerchant = async (req, res) => {
    try {
        const { merchantId } = req.params;

        const merchant = await Merchant.findByIdAndUpdate(
            merchantId,
            { refreshToken: undefined },
            { new: true }
        );

        if (!merchant) {
            return res.status(404).json({ message: "Merchant not found" });
        }

        const options = {
            httpOnly: true,
            secure: true
        };

        return res.status(200)
            .clearCookie("accessToken", options)
            .clearCookie("refreshToken", options)
            .json({ message: "Merchant logged out successfully" });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

// Refresh access token
const refreshAccessToken = async (req, res) => {
    try {
        const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;
        if (!incomingRefreshToken) {
            return res.status(401).json({ msg: "Unauthorized request" });
        }

        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        );

        const merchant = await Merchant.findById(decodedToken._id);

        if (!merchant) {
            return res.status(401).json({ msg: "Invalid refresh token" });
        }

        if (incomingRefreshToken !== merchant.refreshToken) {
            return res.status(401).json({ msg: "Refresh token is expired or used" });
        }

        const options = {
            httpOnly: true,
            secure: true
        };

        const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(merchant._id);

        return res.status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", refreshToken, options)
            .json({ msg: "Access token refreshed" });
    } catch (error) {
        return res.status(401).json({ error: error.message });
    }
};




// Update merchant details
const updateMerchantDetails = async (req, res) => {
    const { merchantId } = req.params;
    const updateData = req.body;

    try {
        const updatedMerchant = await Merchant.findByIdAndUpdate(merchantId, updateData, { new: true });

        if (!updatedMerchant) {
            return res.status(404).json({ message: "Merchant not found" });
        }

        return res.status(200).json(updatedMerchant);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};


// Get merchant details
const getMerchantDetails = async (req, res) => {
    const { merchantId } = req.params;

    try {
        const merchant = await Merchant.findById(merchantId).select("-password -refreshToken");

        if (!merchant) {
            return res.status(404).json({ message: "Merchant not found" });
        }

        return res.status(200).json(merchant);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

export { createNewMerchantAccount, loginMerchant, logOutMerchant, refreshAccessToken, updateMerchantDetails, getMerchantDetails }