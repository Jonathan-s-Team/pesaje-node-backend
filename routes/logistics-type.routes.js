

const { Router } = require('express');
const { check } = require('express-validator');
const router = Router();

const { getLogisticsTypes } = require('../controllers/logistics-type.controller');
const { validateFields } = require('../middlewares/validate-fields');
const { validateJWT } = require('../middlewares/validate-jwt');


router.get('/', validateJWT, getLogisticsTypes);

module.exports = router;