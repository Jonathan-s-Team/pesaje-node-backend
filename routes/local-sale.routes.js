const { Router } = require('express');
const { check } = require('express-validator');
const { validateFields } = require('../middlewares/validate-fields');
const { validateJWT } = require('../middlewares/validate-jwt');
const { createLocalSale } = require('../controllers/local-sale.controller');

const router = Router();

router.post(
    '/',
    [
        validateJWT,
        check('purchase', 'Purchase ID is required').isMongoId(),
        check('saleDate', 'Sale date is required').isISO8601(),
        check('wholeTotalPounds', 'wholeTotalPounds is required and must be numeric').isNumeric(),
        check('tailTotalPounds', 'tailTotalPounds is required and must be numeric').isNumeric(),
        check('wholeRejectedPounds', 'wholeRejectedPounds is required and must be numeric').isNumeric(),
        check('trashPounds', 'trashPounds is required and must be numeric').isNumeric(),
        check('totalProcessedPounds', 'totalProcessedPounds is required and must be numeric').isNumeric(),
        check('seller', 'Seller is required').notEmpty(),
        check('details', 'Details must be a non-empty array').isArray({ min: 1 }),
        check('details.*.style', 'Style is required').notEmpty(),
        check('details.*.merchat', 'Merchat is required').notEmpty(),
        check('details.*.grandTotal', 'grandTotal is required and must be numeric').isNumeric(),
        check('details.*.poundsGrandTotal', 'poundsGrandTotal is required and must be numeric').isNumeric(),
        check('details.*.items', 'Each detail must include items').isArray({ min: 1 }),
        check('details.*.items.*.size', 'Item size is required').notEmpty(),
        check('details.*.items.*.pounds', 'Item pounds is required and must be numeric').isNumeric(),
        check('details.*.items.*.price', 'Item price is required and must be numeric').isNumeric(),
        check('details.*.items.*.total', 'Item total is required and must be numeric').isNumeric(),
        validateFields
    ],
    createLocalSale
);

module.exports = router;
