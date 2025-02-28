const express = require('express');
const { check, query, body } = require('express-validator');
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

// 🔹 Update period (only name and sizePrices)
router.put(
    '/:id',
    [
        validateJWT,
        check('id', 'Invalid period ID').isMongoId(),
        body('name').optional().notEmpty().withMessage('Name cannot be empty'),
        body('company').not().exists().withMessage('Company cannot be updated'),
        body('sizePrices')
            .optional()
            .isArray({ min: 1 })
            .withMessage('sizePrices must be an array with at least one entry'),
        body('sizePrices.*.sizeId')
            .isMongoId()
            .withMessage('Each sizePrice sizeId must be a valid MongoDB ObjectId'),
        body('sizePrices.*.price')
            .isNumeric()
            .withMessage('Each sizePrice must have a numeric price'),
        validateFields
    ],
    updatePeriod
);

// 🔹 Soft delete a period
router.delete(
    '/:id',
    [
        validateJWT,
        check('id', 'Invalid period ID').isMongoId(),
        validateFields,
    ],
    removePeriod
);

module.exports = router;
