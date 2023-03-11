'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var CuentaSchema = Schema({
    tipo: { type: String, required: true }, //Acá va a ir si es ca, cau, cc, cch
    cliente: { type: Schema.ObjectId, ref: 'cliente', required: true },
    createdAt: { type: Date, default: Date.now, require: true },
    dadoBaja: { type: String, required: false, default: false },
    cbu: { type: String, required: true },
    alias: { type: String, required: true },
    descubierto: { type: Number, required: true },
    nroCuenta: { type: String, required: true }
});

module.exports = mongoose.model('cuenta', CuentaSchema);