const { response } = require('express');
const { generateJWT } = require('../helpers/jwt');
const { loginUser } = require('../services/auth.service');


// const crearUsuario = async (req, res = response) => {

//     const { email, password } = req.body;

//     try {

//         let usuario = await Usuario.findOne({ email });

//         if (usuario) {
//             return res.status(400).json({
//                 ok: false,
//                 msg: 'Un usuario existe con ese correo'
//             });
//         }

//         usuario = new Usuario(req.body);

//         // Encriptar contraseña
//         const salt = bcrypt.genSaltSync();
//         usuario.password = bcrypt.hashSync(password, salt);

//         await usuario.save();

//         // Generar nuestro JWT
//         const token = await generateJWT(usuario.id, usuario.name);

//         res.status(201).json({
//             ok: true,
//             uid: usuario.id,
//             name: usuario.name,
//             token
//         });

//     } catch (error) {
//         console.log(error);
//         res.status(500).json({
//             ok: false,
//             msg: 'Por favor hable con el administrador'
//         });
//     }

// }

const login = async (req, res = response) => {
    try {
        const { username, password } = req.body;
        const result = await loginUser(username, password);
        // console.log(result)
        res.status(200).json({
            ok: true,
            result: result
        });
    } catch (error) {
        res.status(401).json({
            ok: false,
            error: error.message
        });
    }
}

const revalidateToken = async (req, res = response) => {

    const { uid, name } = req;

    // generar un nuevo JWT y retonarlo en esta petición
    const token = await generateJWT(uid, name);

    res.json({
        ok: true,
        uid, name,
        token
    });
}

module.exports = {
    // crearUsuario,
    login,
    revalidateToken,
}