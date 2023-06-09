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
                if (cliente.tipo == "normal" && (data.tipo == "cc" || data.tipo == "cau")) {
                    fsHelper.add_log("CuentaController.registro_cuenta", "La cuenta no puede tener dichas cuentas, actualice a VIP");
                    res.status(400).send({ message: 'La cuenta no puede tener dichas cuentas, actualice a VIP', data: undefined });
                }
                cuentas_arr = await Cuenta.find({ cliente: data.cliente, tipo: data.tipo });
                if (cuentas_arr.length == 0) {
                    if (data.principal) {
                        let cuentas = await Cuenta.find({ cliente: data.cliente })
                        cuentas.forEach(async element => {
                            if (element.principal) await Cuenta.findByIdAndUpdate({ _id: element._id }, { principal: false });
                        });
                    }
                    data.nroCuenta = data.nroCuenta.toUpperCase();
                    data.alias = data.alias.toUpperCase();
                    data.tipo = data.tipo.toLowerCase();
                    var reg = await Cuenta.create(data);
                    res.status(200).send({ data: reg });
                }
                else {
                    fsHelper.add_log("CuentaController.registro_cuenta", "El cliente ya tiene una cuenta de este tipo");
                    res.status(400).send({ message: 'El cliente ya tiene una cuenta de este tipo', data: undefined });
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

const obtener_cuenta_principal_cliente = async function (req, res) {
    if (req.user) {
        let cliente_id = req.params["clienteId"];
        let reg = await Cuenta.find({ cliente: cliente_id, principal: true });
        res.status(200).send({ data: reg });
    } else {
        fsHelper.add_log("CuentaController.obtener_cuenta_principal_cliente", "Usuario no identificado");
        res.status(500).send({ message: 'NoAccess: Usuario no identificado' })
    }
}

const obtener_cuentas_cliente = async function (req, res) {
    if (req.user) {
        let cliente_id = req.params["clienteId"];
        let reg = await Cuenta.find({ cliente: cliente_id });
        res.status(200).send({ data: reg });
    } else {
        fsHelper.add_log("CuentaController.obtener_cuentas_cliente", "Usuario no identificado");
        res.status(500).send({ message: 'NoAccess: Usuario no identificado' })
    }
}

const obtener_detalle_cuenta = async function (req, res) {
    if (req.user) {
        let id = req.params["id"];
        let reg = await Cuenta.findById({ _id: id }).populate('cliente');
        res.status(200).send({ data: reg });
    } else {
        fsHelper.add_log("CuentaController.obtener_detalle_cuenta", "Usuario no identificado");
        res.status(500).send({ message: 'NoAccess: Usuario no identificado' })
    }
}

const crear_cuenta = async function (req, res) {
    if (req.user) {
        let data = req.body;
        let cuenta = await Cuenta.findOne({ cliente: data.cliente, tipo: data.tipo });
        let cuentas = await Cuenta.find({ cliente: data.cliente });
        if (cuenta) {
            fsHelper.add_log("CuentaController.crear_cuenta", "Ya cuenta con una cuenta de este tipo");
            res.status(400).send({ message: 'Ya cuenta con una cuenta de este tipo' })
        } else {
            if (cuentas.length > 0) {
                if (data.principal === 'true') {
                    for (let e of cuentas) {
                        if (e.principal) {
                            await Cuenta.findByIdAndUpdate({ _id: e._id }, { principal: false });
                        }
                    }
                }
            }
            let reg = await Cuenta.create(data);
            res.status(200).send({ data: reg });
        }
    } else {
        fsHelper.add_log("CuentaController.obtener_cuenta_principal_cliente", "Usuario no identificado");
        res.status(500).send({ message: 'NoAccess: Usuario no identificado' })
    }
}
const cambiar_cuenta_principal = async function (req, res) {
    if (req.user) {
        let idCuenta = req.params["id"];
        let idCliente = req.params["clienteId"];
        let cuentas = await Cuenta.find({ cliente: idCliente });
        cuentas.forEach(async e => {
            if (e.principal) {
                await Cuenta.findByIdAndUpdate({ _id: e._id }, { principal: false });
            }
        });
        await Cuenta.findByIdAndUpdate({ _id: idCuenta }, { principal: true });
        res.status(200).send({ message: "Cuenta principal modificada" });
    } else {
        fsHelper.add_log("CuentaController.obtener_cuenta_principal_cliente", "Usuario no identificado");
        res.status(500).send({ message: 'NoAccess: Usuario no identificado' })
    }
}
//#endregion

//#region Functions

function validate_info(data) {
    if (data.tipo != undefined && data.cbu != undefined && data.alias != undefined &&
        data.descubierto != undefined && data.nroCuenta != undefined && data.cliente != undefined && data.principal != undefined) {
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
        data.descubierto === null && data.nroCuenta === null && data.cliente === null && data.principal === null ||
        Object.keys(data.tipo).length === 0 && Object.keys(data.cbu).length === 0 && Object.keys(data.alias).length === 0 &&
        Object.keys(data.descubierto).length === 0 && Object.keys(data.cliente).length === 0 && Object.keys(data.principal).length === 0) {
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
    if (!regex.test(data.cbu)) msj += "El cbu solo puede contener números. "
    if (data.cbu.length != 22) msj += "El cbu debe contener exactamente 22 números. "
    return msj;
}

//#endregion

module.exports = {
    registro_cuenta,
    obtener_cuenta_principal_cliente,
    obtener_cuentas_cliente,
    obtener_detalle_cuenta,
    crear_cuenta,
    cambiar_cuenta_principal
}
