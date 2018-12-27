var jwt = require('jsonwebtoken');
var SEED = require('../config/config').SEED;

//=======================================================
// Verificar Token MIDDLEWARE
//=======================================================

exports.verifyToken = function(req, res, next) {
    var token = req.query.token;
    jwt.verify(token, SEED, (err, decoded) => {
        if (err) {
            return res.status(401).json({
                ok: false,
                mensaje: 'Token incorrecto',
                errors: err
            });
        }
        // In any Route when you use  VerifyToken you can had the user info
        req.usuario = decoded.usuario;
        next();
    });
};