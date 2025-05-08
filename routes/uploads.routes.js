const { Router } = require('express');
const { validateJWT } = require('../middlewares/validate-jwt');
const express = require('express');
const path = require('path');
const fs = require('fs');

const router = Router();

// Serve authenticated static files
router.use(
    '/people',
    validateJWT,
    express.static(path.join(__dirname, '..', 'uploads', 'people'))
);

// Optional: serve public uploads without auth
router.use(
    '/public',
    express.static(path.join(__dirname, '..', 'uploads', 'public'))
);

module.exports = router;
