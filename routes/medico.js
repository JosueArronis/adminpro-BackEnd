var express = require('express');
var mdAuth = require('../middlewares/auth');

var app = express();

//MODELS 
var Medico = require('../models/medico');

//=======================================================
// Obtener Todos los Medicos
//=======================================================

app.get('/', (req, res) => {
    var desde = req.query.desde || 0;
    desde = Number(desde);
    Medico.find({})
        .skip(desde)
        .limit(5)
        .populate('usuario', 'nombre email')
        .populate('hospital')
        .exec((err, resp) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error cargando medicos',
                    errors: err
                });
            }
            Medico.count({}, (err, conteo) => {
                res.status(200).json({
                    ok: true,
                    medicos: resp,
                    total: conteo
                });
            });
        })
});
//=======================================================
// Crear un nuevo Medico
//=======================================================

app.post('/', mdAuth.verifyToken, (req, res) => {
    var body = req.body;
    var medico = new Medico({
        nombre: body.nombre,
        hospital: body.hospital_id,
        usuario: req.usuario._id,
        // img: body.img
    });
    medico.save((err, resp) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear medico',
                errors: err
            });
        }
        res.status(201).json({
            ok: true,
            medico: resp,
            usuariotoken: req.usuario
        });
    });
});

//=======================================================
// Actualizar Medico
//=======================================================

app.put('/:id', mdAuth.verifyToken, (req, res) => {
    var id = req.params.id;
    var body = req.body;
    Medico.findById(id, (err, medico) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar medico',
                errors: err
            });
        }
        if (!medico) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El medico con el id ' + id + ' no existe',
                errors: {
                    message: 'No existe un medico con ese ID'
                }
            });
        }
        medico.nombre = body.nombre;
        medico.usuario = req.usuario._id;
        if ((body.hospital_id.length === 0) || body.hospital_id === null) {
            medico.hospital = medico.hospital;
        } else {
            medico.hospital = body.hospital_id;
        }
        medico.save((err, medicoGuardado) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar el medico',
                    errors: err
                });
            }
            res.status(200).json({
                ok: true,
                medico: medicoGuardado
            });
        });
    });
});

//=======================================================
// Eliminar Medico por el id
//=======================================================

app.delete('/:id', mdAuth.verifyToken, (req, res) => {
    var id = req.params.id;

    Medico.findByIdAndDelete(id, (err, medicoDelete) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar medico',
                errors: err
            });
        }
        if (!medicoDelete) {
            return res.status(400).json({
                ok: false,
                mensaje: 'No existe un medico con ese ID ',
                errors: {
                    message: 'No existe un medico con ese ID'
                }
            });
        }
        res.status(200).json({
            ok: true,
            medico: medicoDelete
        });
    })
});

module.exports = app;