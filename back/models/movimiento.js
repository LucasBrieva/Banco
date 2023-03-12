'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var MovimientoSchema = Schema({
    cuenta: {type: Schema.ObjectId, ref: 'cuenta', required: true},
    tipo:{type: String, required: true}, //Puede ser transf, dep, ret, usar ENUM tipoMovimiento
    monto: {type: Number, required: true},
    descripcion: {type: String, required: true},
    comentario: {type: String, required: false},
    cbuDestino: {type: String, required: false},
    isIngreso: {type: Boolean, required: true},
    createdAt: {type:Date, default: Date.now, require: true},
});

module.exports= mongoose.model('movimiento', MovimientoSchema);