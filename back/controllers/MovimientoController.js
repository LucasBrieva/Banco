'use strict'

var Movimiento = require('../models/movimiento');
var Cuenta = require('../models/cuenta');
var tipoMovimiento = require('../enums/tipoMovimiento')
var bcrypt = require('bcrypt-nodejs');
var jwt = require('../helpers/jwt');
var fsHelper = require('../helpers/fsHelper');

const registro_movimiento = async function (req, res) {
    var data = req.body;
    //Se utiliza un try catch, para poder prevenir que no se envíe algún parametro
    try {
        var cuenta = await Cuenta.findOne({ nroCuenta: data.nroCuenta.toUpperCase() });
        var msjValidacion = await validateData(data, cuenta);
        if (msjValidacion.length == 0) {
            if (data.tipo.toUpperCase() == tipoMovimiento.tipoMovimiento.TERCEROS ||
                data.tipo.toUpperCase() == tipoMovimiento.tipoMovimiento.PROPIA) {
                data.cuenta = cuenta._id;
                var reg = await Movimiento.create(data);
                res.status(200).send({ data: reg });
            } else {
                data.cbuDestino = "";
                data.cuenta = cuenta._id;
                var reg = await Movimiento.create(data);
                res.status(200).send({ data: reg });
            }
        }
        else {
            fsHelper.add_log_array("MovimientoController.registro_movimiento", msjValidacion);
            res.status(500).send({ message: msjValidacion });
        }

    } catch (error) {
        fsHelper.add_log("MovimientoController.registro_movimiento", "ServerError: " + error.message);
        res.status(500).send({ message: 'ServerError: Posiblemente falten datos' });
    }
}

async function validateData(data, cuenta) {
    var msj = [];
    if (cuenta == undefined) {
        msj.push("Número de cuenta origen incorrecto, favor de verificar.");
    }
    if (data.tipo != undefined && data.tipo != null && data.tipo != "") {
        if (data.tipo.toUpperCase() != tipoMovimiento.tipoMovimiento.TERCEROS &&
            data.tipo.toUpperCase() != tipoMovimiento.tipoMovimiento.PROPIA &&
            data.tipo.toUpperCase() != tipoMovimiento.tipoMovimiento.DEPOSITO &&
            data.tipo.toUpperCase() != tipoMovimiento.tipoMovimiento.RETIRO) {
            msj.push("Tipo de movimiento incorrecto, favor de verificar.");
        }
        if (data.tipo.toUpperCase() == tipoMovimiento.tipoMovimiento.TERCEROS) {
            if (data.cbuDestino == undefined || data.cbuDestino == null || data.cbuDestino == "") {
                msj.push("Al ser una transferencia a terceros es necesario el cbu destino.");
            } else {
                if (data.cbuDestino.length == 22) {
                    var cuentaDestino = await Cuenta.findOne({ cbu: data.cbuDestino });
                    if (cuentaDestino == undefined) {
                        msj.push("No existe el cbu ingresado, favor de verificar.");
                    }
                    else if (cuentaDestino.cliente.equals(cuenta.cliente)) {
                        msj.push("El cbu al que intenta enviar es propio, favor de verificar.");
                    }
                }
                else {
                    msj.push("El cbu debe contener 22 números, favor de verificar.");

                }
            }
        }
        if (data.tipo.toUpperCase() == tipoMovimiento.tipoMovimiento.PROPIA) {
            if (data.cbuDestino == undefined || data.cbuDestino == null || data.cbuDestino == "") {
                msj.push("Al ser una transferencia a terceros es necesario el cbu destino.");
            } else {
                if (data.cbuDestino.length == 22) {
                    var cuentaDestino = await Cuenta.findOne({ cbu: data.cbuDestino });
                    if (cuentaDestino == undefined) {
                        msj.push("No existe el cbu ingresado, favor de verificar.");
                    }
                    else if (!cuentaDestino.cliente.equals(cuenta.cliente) ) {
                        msj.push("El cbu al que intenta enviar no es propio, favor de verificar.");
                    }
                }
                else {
                    msj.push("El cbu debe contener 22 números, favor de verificar.");
                }
            }
        }
    }
    else {
        msj.push("El tipo es requerido.");
    }
    if (data.descripcion == undefined || data.descripcion == null || data.descripcion == "") {
        msj.push("La descripción es requerida.")
    }
    if (data.monto != undefined && data.monto != null && data.monto != "") {
        if (isNaN(Number(data.monto))) {
            msj.push("El monto ingresado no es un número, favor de verificar.");
        }
    }
    else {
        msj.push("El monto es requerido.");
    }
    return msj;
}

module.exports = {
    registro_movimiento
}
