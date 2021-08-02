const express = require('express');
const { register, login, forgotPassword, resetPassword } = require('../controllers/auth');
const router = express.Router();

router.route('/register').post(register);

router.route('/login').post(login);

router.route('/forgotpassword').post(forgotPassword);

router.route('/resetpassword/:resetToken').put(resetPassword);


module.exports = router;