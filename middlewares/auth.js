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
// ======================================
//  Verificar Admin
// ======================================
exports.verifyAdmin_Role = function(req, res, next) {
    var usuario = req.usuario;
    if (usuario.role === 'ADMIN_ROLE') {
        next();
        return;
    } else {
        // No admin
        return res.status(401).json({
            ok: false,
            mensaje: 'Token incorrecto',
            errors: { message: 'Accion no permitida' }
        });
    }
};
// ======================================
//  Verificar Admin o mismo usuario
// ======================================
exports.verifyAdmin_o_Mismo = function(req, res, next) {
    var usuario = req.usuario;
    var id = req.params.id;
    if (usuario.role === 'ADMIN_ROLE' || usuario._id === id) {
        next();
        return;
    } else {
        // No admin or same User
        return res.status(401).json({
            ok: false,
            mensaje: 'Token incorrecto',
            errors: { message: 'Accion no permitida' }
        });
    }
};