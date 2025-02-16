

const { Router } = require('express');
const { check, query, param } = require('express-validator');
const router = Router();

const { createUser, getUsers, getUserById, updateUser, deleteUser } = require('../controllers/user.controller');
const { validateFields } = require('../middlewares/validate-fields');
const { validateJWT } = require('../middlewares/validate-jwt');


router.post(
    '/',
    [
        // User fields validation
        check('username', 'Username is required').not().isEmpty(),
        check('password', 'Password must be at least 6 characters long').isLength({ min: 6 }),
        check('roles', 'Roles must be an array and contain at least one role').isArray({ min: 1 }),

        // Person fields validation
        check('person.names', 'Person names are required').not().isEmpty(),
        check('person.lastNames', 'Person last names are required').not().isEmpty(),
        check('person.identification', 'Identification is required').not().isEmpty(),
        check('person.birthDate', 'Birthdate must be a valid date').isISO8601(),
        check('person.address', 'Address is required').not().isEmpty(),
        check('person.mobilePhone', 'Mobile phone is required').not().isEmpty(),
        check('person.email', 'Valid email is required').isEmail(),
        check('person.emergencyContactName', 'Emergency contact name is required').not().isEmpty(),
        check('person.emergencyContactPhone', 'Emergency contact phone is required').not().isEmpty(),

        validateFields,
        validateJWT
    ],
    createUser
);
router.get('/',
    [
        query('includeDeleted')
            .optional()
            .custom(value => {
                if (value !== 'true' && value !== 'false') {
                    throw new Error('includeDeleted must be either true or false');
                }
                return true;
            }),
        validateFields,
        validateJWT,
    ],
    getUsers);
router.get('/:id', validateJWT, getUserById);
router.put(
    '/:id',
    [
        param('id').isMongoId().withMessage('Invalid User ID format'),
        // User update validation (optional fields)
        check('username', 'Username cannot be empty').optional().not().isEmpty(),
        check('password', 'Password must be at least 6 characters long').optional().isLength({ min: 6 }),
        check('roles', 'Roles must be an array').optional().isArray(),

        // Person update validation (optional but required if included)
        check('person.names', 'Person names cannot be empty').optional().not().isEmpty(),
        check('person.lastNames', 'Person last names cannot be empty').optional().not().isEmpty(),
        check('person.identification', 'Identification cannot be empty').optional().not().isEmpty(),
        check('person.birthDate', 'Birthdate must be a valid date').optional().isISO8601(),
        check('person.address', 'Address cannot be empty').optional().not().isEmpty(),
        check('person.mobilePhone', 'Mobile phone cannot be empty').optional().not().isEmpty(),
        check('person.email', 'Valid email is required').optional().isEmail(),
        check('person.emergencyContactName', 'Emergency contact name cannot be empty').optional().not().isEmpty(),
        check('person.emergencyContactPhone', 'Emergency contact phone cannot be empty').optional().not().isEmpty(),

        validateFields,
        validateJWT
    ],
    updateUser
);
router.delete(
    '/:id',
    [
        param('id').isMongoId().withMessage('Invalid User ID format'),
        validateFields,
        validateJWT
    ],
    deleteUser
);

module.exports = router;