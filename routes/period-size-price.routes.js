const express = require('express');
const { check, query, body, param } = require('express-validator');
const { validateFields } = require('../middlewares/validate-fields');
const { validateJWT } = require('../middlewares/validate-jwt');
const {
    getPeriodById,
    getAllPeriodsByCompany,
    createPeriod,
    updatePeriod,
    removePeriod
} = require('../controllers/period-size-price.controller');

const router = express.Router();

// 🔹 Get period by id, including sizePrices
router.get(
    '/:id',
    [
        validateJWT,
        param('id').isMongoId().withMessage('Invalid Period ID format'),
        validateFields
    ],
    getPeriodById
);

// 🔹 Get periods by company
router.get(
    '/all/by-company',
    [
        validateJWT,
        query('companyId').isMongoId().withMessage('Invalid company ID format'),
        validateFields
    ],
    getAllPeriodsByCompany
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

// 🔹 Update period (only sizePrices)
router.put(
    '/:id',
    [
        validateJWT,
        check('id', 'Invalid period ID').isMongoId(),
        body('name').not().exists().withMessage('Name cannot be updated'),
        body('company').not().exists().withMessage('Company cannot be updated'),
        body('sizePrices')
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
