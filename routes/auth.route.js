const express = require('express');
const router = express.Router();
const authCtrl = require('../controller/auth.controller')
const auth = require('../middleware/auth')

// router.post('/check',auth,userCtrl.checkAdmin);

router.post('/login', authCtrl.loginUser);

router.post('/signup',authCtrl.registerUser)

// router.post('/forgotpswd',userCtrl.forgotpassword)

router.post('/logout',auth,authCtrl.logoutUser);

module.exports = router;