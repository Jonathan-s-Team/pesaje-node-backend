const express = require('express');
const { check, query } = require('express-validator');
const { validateFields } = require('../middlewares/validate-fields');
const { validateJWT } = require('../middlewares/validate-jwt');
const {
    getAllShrimpFarms,
    getShrimpFarmsByClientId,
    getShrimpFarmById,
    createShrimpFarm,
    updateShrimpFarm,
    removeShrimpFarm
} = require('../controllers/shrimp-farm.controller');

const router = express.Router();

// 🔹 Get all shrimp farms
router.get(
    '/all',
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
        validateFields
    ],
    getAllShrimpFarms
);

// 🔹 Get shrimp farms by client ID (now used only when `clientId` is provided)
router.get(
    '/',
    [
        validateJWT,
        query('clientId')
            .isMongoId().withMessage('Invalid client ID format'),
        query('includeDeleted')
            .optional()
            .custom(value => {
                if (value !== 'true' && value !== 'false') {
                    throw new Error('includeDeleted must be either true or false');
                }
                return true;
            }),
        validateFields
    ],
    getShrimpFarmsByClientId
);

// 🔹 Get shrimp farm by ID
router.get('/:id', validateJWT, getShrimpFarmById);

// 🔹 Create a shrimp farm
router.post(
    '/',
    [
        validateJWT,
        check('identifier', 'Identifier is required').notEmpty(),
        check('numberHectares', 'Number of hectares is required').isNumeric(),
        check('place', 'Place is required').notEmpty(),
        check('transportationMethod', 'Invalid transportation method').isIn(Object.values(require('../enums/transportation-method.enum'))),
        check('distanceToGate', 'Distance to gate is required').isNumeric(),
        check('timeFromPedernales', 'Time from Pedernales is required').isNumeric(),
        check('client', 'Client ID must be a valid MongoDB ObjectId').isMongoId(),
        validateFields
    ],
    createShrimpFarm
);

// 🔹 Update a shrimp farm
router.put('/:id', validateJWT, validateFields, updateShrimpFarm);

// 🔹 Soft delete a shrimp farm
router.delete('/:id', validateJWT, removeShrimpFarm);

module.exports = router;
