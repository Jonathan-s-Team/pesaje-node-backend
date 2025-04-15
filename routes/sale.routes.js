const { Router } = require('express');
const { check, body } = require('express-validator');
const { validateFields } = require('../middlewares/validate-fields');
const { validateJWT } = require('../middlewares/validate-jwt');
const {
    getSalesByParams
} = require('../controllers/sale.controller');

const router = Router();

const { query } = require('express-validator');
const LogisticsTypeEnum = require('../enums/logistics-type.enum');

router.get(
    '/by-params',
    [
        validateJWT,
        query('userId').optional().isMongoId().withMessage('Invalid user ID format'),
        query('controlNumber')
            .optional()
            .isString()
            .withMessage('Control number must be a string'),
        query('includeDeleted').optional().custom(value => {
            if (value !== 'true' && value !== 'false') {
                throw new Error('includeDeleted must be either true or false');
            }
            return true;
        }),
        validateFields
    ],
    getSalesByParams
);

module.exports = router;
