'use strict'

var Cuenta = require('../models/cuenta');
var Cliente = require('../models/cliente');
var bcrypt = require('bcrypt-nodejs');
var jwt = require('../helpers/jwt');
var fsHelper = require('../helpers/fsHelper');

const registro_cuenta = async function (req, res) {
    var cuentas_arr = [];
    var cliente = {};
    var msj_validacion = "";
    var data = req.body;

    if (validate_info(data)) {
        try {
            cuentas_arr = await Cuenta.find();
            msj_validacion = validate_cuentas(cuentas_arr, data);
            if (msj_validacion === "") {
                cliente = await Cliente.findOne({ email: data.cliente });
                data.cliente = cliente._id;
                if (cliente.tipo == "normal") {
                    if (data.tipo == "cc" || data.tipo == "cau") {
                        fsHelper.add_log("CuentaController.registro_cuenta", "La cuenta no puede tener dichas cuentas, actualice a VIP");
                        res.status(400).send({ message: 'La cuenta no puede tener dichas cuentas, actualice a VIP', data: undefined });
                    }
                    cuentas_arr = await Cuenta.find({ cliente: cliente._id, tipo: data.tipo });
                    if (cuentas_arr.length == 0) {
                        var reg = await Cuenta.create(data);
                        res.status(200).send({ data: reg });
                    }
                    else {
                        fsHelper.add_log("CuentaController.registro_cuenta", "El cliente ya tiene una cuenta de este tipo");
                        res.status(400).send({ message: 'El cliente ya tiene una cuenta de este tipo', data: undefined });
                    }
                } else {//VIP
                    cuentas_arr = await Cuenta.find({ cliente: cliente._id, tipo: cliente.tipo });
                    if (cuentas_arr.length == 0) {
                        var reg = await Cuenta.create(data);
                        res.status(200).send({ data: reg });
                    }
                    else {
                        fsHelper.add_log("CuentaController.registro_cuenta", "El cliente ya tiene una cuenta de este tipo");
                        res.status(400).send({ message: 'El cliente ya tiene una cuenta de este tipo', data: undefined });
                    }
                }
            }

        }
        catch {
            fsHelper.add_log("CuentaController.registro_cuenta", "ServerError: Posiblemente falten datos");
            res.status(500).send({ message: 'ServerError' });
        }
    }
    else {
        fsHelper.add_log("CuentaController.registro_cuenta", "Datos ingresados incorrectos");
        res.status(400).send({ message: "Datos ingresados incorrectos", data: undefined });
    }
}


function validate_info(data) {
    if (data.tipo != undefined && data.cbu != undefined && data.alias != undefined &&
        data.descubierto != undefined && data.nroCuenta != undefined && data.cliente != undefined) {
        if (is_null_or_empty(data)) {
            if (data.tipo === "cc" || data.tipo === "ca" || data.tipo === "cch" || data.tipo === "cau") {
                return true;
            }
        }
    }
    return false;
}
function is_null_or_empty(data) {
    if (data.tipo === null && data.cbu === null && data.alias === null &&
        data.descubierto === null && data.nroCuenta === null && data.cliente === null ||
        Object.keys(data.tipo).length === 0 && Object.keys(data.cbu).length === 0 && Object.keys(data.alias).length === 0 &&
        Object.keys(data.descubierto).length === 0 && Object.keys(data.cliente).length === 0) {
        return false;
    }
    return true;
}
function validate_cuentas(array, data) {
    var msj = "";
    array.forEach(e => {
        if (e.cbu === data.cbu) {
            msj += "El CBU ya existe. ";
        }
        if (e.alias === data.alias) {
            msj += "El alias ya existe. ";
        }
        if (e.nroCuenta === data.nroCuenta) {
            msj += "El número de cuenta ya existe. ";
        }
    });
    return msj;
}
module.exports = {
    registro_cuenta
}
