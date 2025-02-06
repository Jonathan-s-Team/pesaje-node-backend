/*
    Rutas de Usuarios / Auth
    host * /api/auth
*/

const { Router } = require('express');
const { check } = require('express-validator');
const router = Router();

const { login, revalidateToken } = require('../controllers/auth.controller');
const { validateFields } = require('../middlewares/validate-fields');
const { validateJWT } = require('../middlewares/validate-jwt');

// router.post(
//     '/new',
//     [// middlewares
//         check('name', 'El nombre es obligatorio').not().isEmpty(),
//         check('email', 'El email es obligatorio').isEmail(),
//         check('password', 'El password debe de ser de 6 caracteres').isLength({ min: 6 }),
//         validarCampos
//     ],
//     crearUsuario);

router.post(
    '/',
    [
        check('password', 'Password must be at least 6 characters long').isLength({ min: 6 }),
        validateFields
    ],
    login);

router.get('/renew', validateJWT, revalidateToken);

module.exports = router;