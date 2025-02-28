

const { Router } = require('express');
const { check } = require('express-validator');
const router = Router();

const { getSizes } = require('../controllers/size.controller');
const { validateFields } = require('../middlewares/validate-fields');
const { validateJWT } = require('../middlewares/validate-jwt');


router.get('/', validateJWT, getSizes);

module.exports = router;