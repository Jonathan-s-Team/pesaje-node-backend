const mongoose = require('mongoose');

const dbConnection = async () => {

    try {

        mongoose.connect(process.env.DB_CNN);

        console.log('DB online');

    } catch (error) {
        console.log(error);
        throw new Error('Error initializing the database');
    }
}

module.exports = {
    dbConnection
}