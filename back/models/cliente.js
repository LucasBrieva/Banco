'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ClienteSchema = Schema({
    nombres: {type: String, required: true},
    apellidos:{type: String, required: true},
    email: {type: String, required: true},
    pais: {type: String, required: true},
    password: {type: String, required: true},
    perfil: {type: String, default:'perfil.png', required: false},
    telefono: {type: String, required: true},
    genero: {type: String, required: false},
    f_nacimiento: {type: String, required: true},
    dni: {type: String, required: true},
    createdAt: {type:Date, default: Date.now, require: true},
    dadoBaja:{type:String, required: false, default: false},
    tipo: {type:String, required: true} //Esto puede ser normal o vip
});

module.exports= mongoose.model('cliente', ClienteSchema);