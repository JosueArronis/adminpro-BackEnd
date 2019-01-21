var express = require('express');
var bcrypt = require('bcryptjs');

var mdAuth = require('../middlewares/auth');

var app = express();

var Usuario = require('../models/usuario');

//=======================================================
// Obtener Todos los Usuarios Omitiendo el campo password
//=======================================================

app.get('/', (req, res, next) => {

    var desde = req.query.desde || 0;
    desde = Number(desde);

    Usuario.find({}, 'nombre email img role google')
        .skip(desde)
        .limit(5)
        .exec(
            (err, resp) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error cargando Usuarios',
                        errors: err
                    });
                }
                Usuario.count({}, (err, conteo) => {
                    res.status(200).json({
                        ok: true,
                        usuarios: resp,
                        total: conteo
                    });
                })
            });
});

//=======================================================
// Actualizar Usuario
//=======================================================

app.put('/:id', mdAuth.verifyToken, (req, res) => {
    var id = req.params.id;
    var body = req.body;
    Usuario.findById(id, (err, usuario) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar usuario',
                errors: err
            });
        }
        if (!usuario) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El usuario con el id ' + id + ' no existe',
                errors: {
                    message: 'No existe un usuario con ese ID'
                }
            });
        }
        usuario.nombre = body.nombre;
        usuario.email = body.email;
        usuario.role = body.role;
        usuario.save((err, usuarioGuardado) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar usuario',
                    errors: err
                });
            }
            usuarioGuardado.password = '';
            res.status(200).json({
                ok: true,
                usuario: usuarioGuardado
            });
        });
    });
});

//=======================================================
// Crear un nuevo Usuario
//=======================================================

app.post('/', (req, res) => {
    var body = req.body;
    var usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
        img: body.img,
        role: body.role,
    });
    usuario.save((err, resp) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear usuario',
                errors: err
            });
        }
        res.status(201).json({
            ok: true,
            usuario: resp,
            usuariotoken: req.usuario
        });
    });
});

//=======================================================
// Eliminar Usuario por el id
//=======================================================

app.delete('/:id', mdAuth.verifyToken, (req, res) => {
    var id = req.params.id;

    Usuario.findByIdAndDelete(id, (err, userDelete) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar usuario',
                errors: err
            });
        }
        if (!userDelete) {
            return res.status(400).json({
                ok: false,
                mensaje: 'No existe un usuario con ese ID ',
                errors: { message: 'No existe un usuario con ese ID' }
            });
        }
        res.status(200).json({
            ok: true,
            usuario: userDelete
        });
    })
});

module.exports = app;