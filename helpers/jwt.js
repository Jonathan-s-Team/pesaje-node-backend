const jwt = require('jsonwebtoken');

const generateJWT = (uid, name) => {

    return new Promise((resolver, reject) => {

        const payload = { uid, name };

        jwt.sign(payload, process.env.SECRET_JWT_SEED, {
            expiresIn: '2h'
        }, (err, token) => {
            if (err) {
                console.log(err);
                reject('Token could not be generated');
            }

            resolver(token);
        });
    })
}

module.exports = {
    generarJWT: generateJWT
}