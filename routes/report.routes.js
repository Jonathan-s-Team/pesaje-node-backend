const express = require('express');
const { check, query, param } = require('express-validator');
const { validateFields } = require('../middlewares/validate-fields');
const { validateJWT } = require('../middlewares/validate-jwt');

const {
    getEconomicReportByParams
} = require('../controllers/report.controller');

const router = express.Router();

// 🔹 Get all purchases with optional filters
router.get(
    '/economic/by-params',
    [
        validateJWT,
        query('includeDeleted')
            .optional()
            .custom(value => {
                if (value !== 'true' && value !== 'false') {
                    throw new Error('includeDeleted must be either true or false');
                }
                return true;
            }),
        query('clientId').optional().isMongoId().withMessage('Client ID must be a valid MongoDB ObjectId'),
        query('userId').optional().isMongoId().withMessage('User ID must be a valid MongoDB ObjectId'),
        query('periodId').optional().isMongoId().withMessage('Period ID must be a valid MongoDB ObjectId'),
        query('controlNumber')
            .optional()
            .isString()
            .withMessage('Control number must be a string'),
        validateFields,
    ],
    getEconomicReportByParams
);

module.exports = router;
