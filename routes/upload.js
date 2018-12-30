var express = require('express');
var fileUpload = require('express-fileupload');
var fs = require('fs');

var app = express();

// Models 

var Hospital = require('../models/hospital');
var Usuario = require('../models/usuario');
var Medico = require('../models/medico');

// default options
app.use(fileUpload());

// ====================================
//  Upload imgs
// ====================================
app.put('/:tipo/:id', (req, res) => {

    var tipo = req.params.tipo;
    var id = req.params.id;

    // valid tipo 

    var validTipos = ['usuarios', 'hospitales', 'medicos'];

    if (validTipos.indexOf(tipo) < 0) {
        return res.status(400).json({
            ok: false,
            mensaje: 'Tipo de colecion no valido',
            errors: {
                message: 'Los tipos colecion validos son: ' + validTipos.join(', ')
            }
        });
    }


    if (!req.files) {
        return res.status(400).json({
            ok: false,
            mensaje: 'No se selecciono nada',
            errors: { message: 'Debe de seleccionar una imagen' }
        });
    }

    // Get file name and ext

    var archivo = req.files.imagen;
    var splitname = archivo.name.split('.');
    var extFile = splitname[splitname.length - 1];

    // valid ext 
    var validExt = ['png', 'jpg', 'gif', 'jpeg'];

    if (validExt.indexOf(extFile) < 0) {
        return res.status(400).json({
            ok: false,
            mensaje: 'Extension no valida',
            errors: {
                message: 'Las extensiones validas son: ' + validExt.join(', ')
            }
        });
    }

    // Generate unique File name
    var newNameFile = `${ id }-${ new Date().getMilliseconds() }.${ extFile }`;

    // Move the temp file to new path

    var path = `./uploads/${ tipo }/${ newNameFile }`;

    subirPorTipo(tipo, id, newNameFile, path, archivo, res);

});

function subirPorTipo(tipo, id, newNameFile, path, archivo, res) {
    if (tipo === 'usuarios') {

        Usuario.findById(id, (err, usuario) => {
            if (!usuario) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Usuario no existe',
                    errors: { message: "Usuario no existe" }
                });
            }
            var oldPath = './uploads/usuarios/' + usuario.img;
            // if the user already had a img, that img will be deleted
            if (fs.existsSync(oldPath)) {
                fs.unlink(oldPath, (err) => {
                    if (err) throw err;
                });
            }
            usuario.img = newNameFile;
            archivo.mv(path, err => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error al mover archivo',
                        errors: err
                    });
                }
                usuario.save((err, userUpdate) => {
                    userUpdate.password = ':)';
                    return res.status(200).json({
                        ok: true,
                        mensaje: 'Imagen de usuario Actualizada',
                        usuario: userUpdate
                    });
                });
            });
        });

    }
    if (tipo === 'hospitales') {
        Hospital.findById(id, (err, hospital) => {
            if (!hospital) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Hospital no existe',
                    errors: {
                        message: "Hospital no existe"
                    }
                });
            }
            var oldPath = './uploads/hospitales/' + hospital.img;
            // if the user already had a img, that img will be deleted
            if (fs.existsSync(oldPath)) {
                fs.unlink(oldPath, (err) => {
                    if (err) throw err;
                });
            }
            hospital.img = newNameFile;
            archivo.mv(path, err => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error al mover archivo',
                        errors: err
                    });
                }
                hospital.save((err, hospitalUpdate) => {
                    return res.status(200).json({
                        ok: true,
                        mensaje: 'Imagen de hospital Actualizada',
                        hospital: hospitalUpdate
                    });
                });
            });
        });
    }
    if (tipo === 'medicos') {
        Medico.findById(id, (err, medico) => {
            if (!medico) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Medico no existe',
                    errors: {
                        message: "Medico no existe"
                    }
                });
            }
            var oldPath = './uploads/medicos/' + medico.img;
            // if the user already had a img, that img will be deleted
            if (fs.existsSync(oldPath)) {
                fs.unlink(oldPath, (err) => {
                    if (err) throw err;
                });
            }
            medico.img = newNameFile;
            archivo.mv(path, err => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error al mover archivo',
                        errors: err
                    });
                }
                medico.save((err, medicoUpdate) => {
                    return res.status(200).json({
                        ok: true,
                        mensaje: 'Imagen de medico Actualizada',
                        medico: medicoUpdate
                    });
                });
            });
        });
    }
}

module.exports = app;