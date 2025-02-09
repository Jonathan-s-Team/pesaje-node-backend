

const { Router } = require('express');
const { seedAllData } = require('../controllers/seed.controller');


const router = Router();


// Obtener eventos
router.get('/all', seedAllData);

module.exports = router;


