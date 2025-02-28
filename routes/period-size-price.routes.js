const express = require('express');
const { check, query } = require('express-validator');
const { validateFields } = require('../middlewares/validate-fields');
const { validateJWT } = require('../middlewares/validate-jwt');
const {
    getPeriodByNameAndCompany,
    createPeriod,
    updatePeriod,
    removePeriod
} = require('../controllers/period-size-price.controller');

const router = express.Router();

// 🔹 Get period by name and company, including sizePrices
router.get(
    '/by-name',
    [
        validateJWT,
        query('companyId').isMongoId().withMessage('Invalid company ID format'),
        query('name').notEmpty().withMessage('Period name is required'),
        validateFields
    ],
    getPeriodByNameAndCompany
);

// 🔹 Create a period with sizePrices
router.post(
    '/',
    [
        validateJWT,
        check('name', 'Name is required').notEmpty(),
        check('company', 'Company ID must be a valid MongoDB ObjectId').isMongoId(),
        check('sizePrices').optional().isArray(),
        validateFields
    ],
    createPeriod
);

// 🔹 Update a period (and optionally update its sizePrices)
router.put('/:id', validateJWT, validateFields, updatePeriod);

// 🔹 Soft delete a period
router.delete('/:id', validateJWT, removePeriod);

module.exports = router;
