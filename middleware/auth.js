const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');

//protected route function
exports.protect = async (req, res, next) => {
    let token;

    //check if header contain a token
    //get the token without the Bearer
    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(" ")[1];
    }

    if(!token) {
        return next(new ErrorResponse('Not authorized to access this route', 401));
    }

    try {
        //decrypt and verify the token in the header
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        //compare the decoded token id to the id in the database
        const user = await User.findById(decoded.id);

        if(!user) {
            return next(new ErrorResponse('No user found with this id', 404));
        }

        req.user = user;

        next();
    } catch (error) {
        return next(new ErrorResponse('Not authorized to access this route', 404));
    }
}