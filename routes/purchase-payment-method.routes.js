const { Router } = require('express');
const { check, query } = require('express-validator');
const { validateFields } = require('../middlewares/validate-fields');
const { validateJWT } = require('../middlewares/validate-jwt');
const {
    createPurchasePaymentMethod,
    getPurchasePaymentsByPurchaseId,
    deletePurchasePaymentMethod
} = require('../controllers/purchase-payment-method.controller');

const router = Router();

// 🔹 Get all payments for a specific purchase
router.get(
    '/',
    [
        validateJWT,
        query('purchaseId', 'Invalid purchase ID')
            .optional()
            .isMongoId(),
        validateFields
    ],
    getPurchasePaymentsByPurchaseId
);


// 🔹 Create a new payment method entry
router.post(
    '/',
    [
        validateJWT,
        check('purchase', 'Purchase ID is required').isMongoId(),
        check('paymentMethod', 'Payment Method ID is required').isMongoId(),
        check('amount', 'Amount must be a positive number').isFloat({ min: 0 }),
        check('paymentDate', 'Payment date is required and must be a valid date').isISO8601(),
        validateFields
    ],
    createPurchasePaymentMethod
);

// 🔹 Soft delete a payment method entry
router.delete(
    '/:id',
    [
        validateJWT,
        check('id', 'Invalid payment method ID').isMongoId(),
        validateFields
    ],
    deletePurchasePaymentMethod
);

module.exports = router;
