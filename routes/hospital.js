var express = require('express');
var mdAuth = require('../middlewares/auth');

var app = express();

//MODELS 
var Hospital = require('../models/hospital');

//=======================================================
// Obtener Todos los Hospitales
//=======================================================

app.get('/', (req, res) => {
    var desde = req.query.desde || 0;
    desde = Number(desde);
    Hospital.find({})
        .skip(desde)
        .limit(5)
        .populate('usuario', 'nombre email')
        .exec((err, resp) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error cargando hospitales',
                    errors: err
                });
            }
            Hospital.count({}, (err, conteo) => {
                res.status(200).json({
                    ok: true,
                    hospitales: resp,
                    total: conteo
                });
            })

        })
});
// ==========================================
// Obtener Hospital por ID
// ==========================================
app.get('/:id', (req, res) => {
    var id = req.params.id;
    Hospital.findById(id)
        .populate('usuario', 'nombre img email')
        .exec((err, hospital) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al buscar hospital',
                    errors: err
                });
            }
            if (!hospital) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'El hospital con el id ' + id + 'no existe',
                    errors: { message: 'No existe un hospitalcon ese ID' }
                });
            }
            res.status(200).json({
                ok: true,
                hospital: hospital
            });
        })
});

//=======================================================
// Crear un nuevo Hospital
//=======================================================

app.post('/', mdAuth.verifyToken, (req, res) => {
    var body = req.body;
    var hospital = new Hospital({
        nombre: body.nombre,
        usuario: req.usuario._id,
        // img: body.img
    });
    hospital.save((err, resp) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear hospital',
                errors: err
            });
        }
        res.status(201).json({
            ok: true,
            hospital: resp,
            usuariotoken: req.usuario
        });
    });
});

//=======================================================
// Actualizar Hospital
//=======================================================

app.put('/:id', mdAuth.verifyToken, (req, res) => {
    var id = req.params.id;
    var body = req.body;
    Hospital.findById(id, (err, hospital) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar hospital',
                errors: err
            });
        }
        if (!hospital) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El hospital con el id ' + id + ' no existe',
                errors: {
                    message: 'No existe un hospital con ese ID'
                }
            });
        }
        hospital.nombre = body.nombre;
        hospital.usuario = req.usuario._id;
        hospital.save((err, hospitalGuardado) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar el hospital',
                    errors: err
                });
            }
            res.status(200).json({
                ok: true,
                hospital: hospitalGuardado
            });
        });
    });
});

//=======================================================
// Eliminar Hospital por el id
//=======================================================

app.delete('/:id', mdAuth.verifyToken, (req, res) => {
    var id = req.params.id;

    Hospital.findByIdAndDelete(id, (err, hospitalDelete) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar hospital',
                errors: err
            });
        }
        if (!hospitalDelete) {
            return res.status(400).json({
                ok: false,
                mensaje: 'No existe un hospital con ese ID ',
                errors: {
                    message: 'No existe un hospital con ese ID'
                }
            });
        }
        res.status(200).json({
            ok: true,
            hospital: hospitalDelete
        });
    })
});

module.exports = app;