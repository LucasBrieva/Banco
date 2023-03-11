'use strict'

var Cuenta = require('../models/cuenta');
var Cliente = require('../models/cliente');
var bcrypt = require('bcrypt-nodejs');
var jwt = require('../helpers/jwt');
var fsHelper = require('../helpers/fsHelper');
const regex = /^[0-9]+$/;
//#region Exports

const registro_cuenta = async function (req, res) {
    var cuentas_arr = [];
    var cliente = {};
    var msj_validacion = "";
    var data = req.body;

    if (validate_info(data)) {
        try {
            cuentas_arr = await Cuenta.find();
            msj_validacion = validate_data_cuentas(cuentas_arr, data);
            if (msj_validacion === "") {
                cliente = await Cliente.findOne({ email: data.cliente.toLowerCase() });
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
            else {
                fsHelper.add_log("CuentaController.registro_cuenta", msj_validacion);
                res.status(400).send({ message: msj_validacion, data: undefined });
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

const obtener_cuentas_cliente = async function (req, res) {
    if (req.user) {
        let cliente_id = req.params["clienteId"];
        let reg = await Cuenta.find({ cliente: cliente_id });
        res.status(200).send({ data: reg });
    } else {
        fsHelper.add_log("ClienteController.js", "Hubo un error en ClienteController.listar_clientes_filtro_admin");
        res.status(500).send({ message: 'NoAccess' })
    }
}

//#endregion

//#region Functions

function validate_info(data) {
    if (data.tipo != undefined && data.cbu != undefined && data.alias != undefined &&
        data.descubierto != undefined && data.nroCuenta != undefined && data.cliente != undefined) {
        if (is_null_or_empty(data)) {
            if (data.tipo.toLowerCase() === "cc" || data.tipo.toLowerCase() === "ca" || data.tipo.toLowerCase() === "cch" || data.tipo.toLowerCase() === "cau") {
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
function validate_data_cuentas(array, data) {
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
    if(!regex.test(data.cbu)) msj += "El cbu solo puede contener números. "
    if(data.cbu.length != 22) msj += "El cbu debe contener exactamente 22 números. "
    return msj;
}

//#endregion

module.exports = {
    registro_cuenta,
    obtener_cuentas_cliente
}
