const express = require('express');
require('dotenv').config();
const cors = require('cors');
const { dbConnection } = require('./database/config');

// Crear el servidor de express
const app = express();

// Base de datos
dbConnection();

var corsOptions = {
    origin: [
        'http://localhost:4200',
        'https://pesaje.netlify.app',
    ],
    optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}

// CORS
app.use(cors(corsOptions));

// Directorio Público
app.use(express.static('public'));

// Lectura y parseo del body
app.use(express.json());

// Rutas
app.use('/api/seed', require('./routes/seed.routes'));
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/user', require('./routes/user.routes'));
app.use('/api/payment-info', require('./routes/payment-info.routes'));
app.use('/api/role', require('./routes/role.routes'));
app.use('/api/company', require('./routes/company.routes'));
app.use('/api/size', require('./routes/size.routes'));
app.use('/api/broker', require('./routes/broker.routes'));
app.use('/api/client', require('./routes/client.routes'));
app.use('/api/shrimp-farm', require('./routes/shrimp-farm.routes'));
app.use('/api/period', require('./routes/period-size-price.routes'));
app.use('/api/purchase', require('./routes/purchase.routes'));


// Escuchar peticiones
app.listen(process.env.PORT, () => {
    console.log(`Server up on port ${process.env.PORT}`);
});