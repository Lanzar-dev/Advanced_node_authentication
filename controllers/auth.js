const crypto = require('crypto');
const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');
const sendEmail = require('../utils/sendEmail');

exports.register = async (req, res, next) => {
    const {username, email, password} = req.body;

    try {
        const user = await User.create({
            username, email, password
        });

        //hash the password in the userSchema before getting here
        //generate token from userSchema
        sendToken(user, 201, res);
    } catch (error) {
        next(error);
    }
}

exports.login = async (req, res, next) => {
    const {email, password} = req.body;

    if(!email || !password) {
        return next(new ErrorResponse('Please provide an email and password', 400));
    }

    //check if email provided exist in database
    try {
        const user = await User.findOne({email}).select('+password');

        if(!user) {
            return next(new ErrorResponse('Invalid credentials', 401));
        }

        //check if inputted password matches password in database
        const isMatch = await user.matchPasswords(password);

        if(!isMatch) {
            return next(new ErrorResponse('Invalid credentials', 401));
        }

        //generate token from userSchema
        sendToken(user, 200, res);
    } catch (error) {
        res.status(500).json({success: false, error: error.message});
    }
}

exports.forgotPassword = async (req, res, next) => {
    const {email} = req.body;

    try {
        const user = await User.findOne({email});
        
        if(!user) {
            return next(new ErrorResponse("Email could not be sent", 404));
        }

        const resetToken = user.getResetPasswordToken();

        await user.save();

        //resetUrl is for client side
        const resetUrl = `http://localhost:3000/passwordreset/${resetToken}`;

        const message = `
            <h1>You have requested a password reset</h1>
            <p>Please go to this link to reset your password</p>
            <a href=${resetUrl} clicktrackingh=off>${resetUrl}</a>
        `

        try {
            await sendEmail({
                to: user.email,
                subject: "Password Reset Request",
                text: message
            });

            res.status(200).json({success: true, data: "Email Sent"});
        } catch (error) {
            user.resetPasswordToken = undefined;
            user.resetPasswordExpire = undefined;

            await user.save();
            return next(new ErrorResponse("Email could not be sent", 500));
        }
    } catch (error) {
        next(error);
    }
}

exports.resetPassword = async (req, res, next) => {
    //recreate the password from resetToken in the email sent
    const resetPasswordtoken = crypto.createHash("sha256").update(resetToken).digest("hex");

    try {
        //check if the resetPasswordToken matches the one in the db
        const user = await User.findOne({
            resetPasswordtoken,
            resetPasswordExpire: {$gt: Date.now()}
        });

        if(!user) {
            return next(new ErrorResponse("Invalid Reset Token", 400));
        }

        //update password with the inputted password
        user.password = req.body.password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        //password always get hashed in the UserSchema before saving
        await user.save();

        res.status(200).json({
            success: true,
            data: "Password Reset Successful"
        });
    } catch (error) {
        next(error);
    }
}

//function for sending token declared here to be used in register and login function
const sendToken = (user, statusCode, res) => {
    const token = user.getSignedToken();
    res.status(statusCode).json({success: true, token});
}