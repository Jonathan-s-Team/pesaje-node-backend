

const { Router } = require('express');
const { check } = require('express-validator');
const router = Router();

const { getCompanies } = require('../controllers/company.controller');
const { validateFields } = require('../middlewares/validate-fields');
const { validateJWT } = require('../middlewares/validate-jwt');


router.get('/', validateJWT, getCompanies);

module.exports = router;