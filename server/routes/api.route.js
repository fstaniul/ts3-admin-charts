const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

const router = express.Router();

router.use(bodyParser.json());
router.use(cookieParser());

router.use('/auth', require('./auth.handler.js'));

