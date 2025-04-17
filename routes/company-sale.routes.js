const { Router } = require('express');
const { check, body } = require('express-validator');
const { validateFields } = require('../middlewares/validate-fields');
const { validateJWT } = require('../middlewares/validate-jwt');
const {
    createCompanySale, getCompanySaleById, getCompanySaleBySaleId,
} = require('../controllers/company-sale.controller');
const CompanySaleStyleEnum = require('../enums/company-sale-style.enum');

const router = Router();

router.post(
    '/',
    [
        validateJWT,
        check('purchase', 'Purchase ID is required').isMongoId(),
        check('saleDate', 'Sale date is required').isISO8601(),
        check('document', 'Document is required').notEmpty(),
        check('batch', 'Batch is required').notEmpty(),
        check('provider', 'Provider is required').notEmpty(),
        check('np', 'NP is required').notEmpty(),
        check('serialNumber', 'Serial number is required').isNumeric(),
        check('receptionDateTime', 'Reception date is required').isISO8601(),
        check('settleDateTime', 'Settle date is required').isISO8601(),
        check('batchAverageGram', 'Batch average gram is required').isNumeric(),
        check('wholeReceivedPounds', 'Whole received pounds is required').isNumeric(),
        check('trashPounds', 'Trash pounds is required').isNumeric(),
        check('netReceivedPounds', 'Net received pounds is required').isNumeric(),
        check('processedPounds', 'Processed pounds is required').isNumeric(),
        check('performance', 'Performance is required').isNumeric(),
        check('poundsGrandTotal', 'Pounds grand total is required').isNumeric(),
        check('grandTotal', 'Price grand total is required').isNumeric(),
        check('percentageTotal', 'Percentage total is required').isNumeric(),

        // 🔹 Items array and subfields
        check('items', 'Items must be a non-empty array').isArray({ min: 1 }),
        check('items.*.style')
            .notEmpty()
            .withMessage('Style is required')
            .isIn(Object.values(CompanySaleStyleEnum))
            .withMessage(`Style must be one of: ${Object.values(CompanySaleStyleEnum).join(', ')}`),
        check('items.*.class', 'Class is required').notEmpty(),
        check('items.*.size', 'Size is required').notEmpty(),
        check('items.*.pounds', 'Pounds must be a number').isNumeric(),
        check('items.*.price', 'Price must be a number').isNumeric(),
        check('items.*.total', 'Total must be a number').isNumeric(),
        check('items.*.percentage', 'Percentage must be a number').isNumeric(),

        validateFields,
    ],
    createCompanySale
);

router.get(
    '/:id',
    [
        validateJWT,
        check('id', 'Invalid sale ID').isMongoId(),
        validateFields
    ],
    getCompanySaleById
);

router.get(
    '/by-sale/:saleId',
    [
        validateJWT,
        check('saleId', 'Invalid Sale ID').isMongoId(),
        validateFields
    ],
    getCompanySaleBySaleId
);

module.exports = router;
