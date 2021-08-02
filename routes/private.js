const express = require('express');
const { getPrivateData } = require('../controllers/private');
const { protect } = require('../middleware/auth');
const router = express.Router();

//this is a protected/private route
router.route('/').get(protect, getPrivateData);

module.exports = router;