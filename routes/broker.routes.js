const express = require('express');
const { check, query } = require('express-validator');
const router = express.Router();

const { getAllBrokersByUserId, getBrokerById, createBroker, updateBroker, removeBroker } = require('../controllers/broker.controller');
const { validateFields } = require('../middlewares/validate-fields');
const { validateJWT } = require('../middlewares/validate-jwt');


router.get(
    '/',
    [
        query('userId')
            .isMongoId()
            .withMessage('Invalid user ID format'), // Ensure personId is a valid ObjectId
        validateFields, // Ensure this is included to process validation
        validateJWT
    ],
    getAllBrokersByUserId
);
router.get('/:id', validateJWT, getBrokerById);

router.post(
    '/',
    [
        // Validate embedded person fields
        check('person.names', 'Names are required').notEmpty(),
        check('person.lastNames', 'Last names are required').notEmpty(),
        check('person.identification', 'Identification is required').notEmpty(),
        check('person.birthDate', 'Birth date is required').isISO8601(),
        check('person.address', 'Address is required').notEmpty(),
        check('person.mobilePhone', 'Mobile phone is required').notEmpty(),
        check('person.email', 'Email is required').isEmail(),
        check('person.emergencyContactName', 'Emergency contact name is required').notEmpty(),
        check('person.emergencyContactPhone', 'Emergency contact phone is required').notEmpty(),

        // Validate buyer ID
        check('buyerItBelongs', 'User ID is required').isMongoId(),
        validateFields,
        validateJWT
    ],
    createBroker
);

router.put(
    '/:id',
    [
        check('person.names', 'Names are required').optional().notEmpty(),
        check('person.lastNames', 'Last names are required').optional().notEmpty(),
        check('person.identification', 'Identification is required').optional().notEmpty(),
        check('person.birthDate', 'Birth date is required').optional().isISO8601(),
        check('person.address', 'Address is required').optional().notEmpty(),
        check('person.mobilePhone', 'Mobile phone is required').optional().notEmpty(),
        check('person.email', 'Email is required').optional().isEmail(),
        check('person.emergencyContactName', 'Emergency contact name is required').optional().notEmpty(),
        check('person.emergencyContactPhone', 'Emergency contact phone is required').optional().notEmpty(),

        // Validate buyer ID
        check('buyerItBelongs', 'User ID is required').optional().isMongoId(),
        validateFields,
        validateJWT
    ],
    updateBroker
);

router.delete('/:id', validateJWT, removeBroker);

module.exports = router;
