'use strict'

var Movimiento = require('../models/movimiento');
var Cuenta = require('../models/cuenta');
var tipoMovimiento = require('../enums/tipoMovimiento')
var bcrypt = require('bcrypt-nodejs');
var jwt = require('../helpers/jwt');
var fsHelper = require('../helpers/fsHelper');

const registro_movimiento = async function (req, res) {
    var data = req.body;
    var ctaDestino;
    //Se utiliza un try catch, para poder prevenir que no se envíe algún parametro
    try {
        var cuenta = await Cuenta.findOne({ nroCuenta: data.nroCuenta.toUpperCase() });
        var msjValidacion = await validateData(data, cuenta);
        if (Object.keys(msjValidacion).length === 0) {
            if (data.tipo.toUpperCase() == tipoMovimiento.tipoMovimiento.TERCEROS ||
                data.tipo.toUpperCase() == tipoMovimiento.tipoMovimiento.PROPIA) {
                data.cuenta = cuenta._id;
                var cbuDestino = await Cuenta.findOne({ cbu: data.cbuDestino });
                ctaDestino = cbuDestino;
                data.cbuDestino = cbuDestino._id;

            } else {
                data.cbuDestino = "";
                data.cuenta = cuenta._id;
            }
            data.isIngreso = (data.isIngreso.toLowerCase() === 'true');
            if (data.isIngreso) {
                await Cuenta.findByIdAndUpdate({ _id: cuenta._id }, {
                    saldo: Number(cuenta.saldo) + Number(data.monto),
                });
            }
            else {
                //Actualizo saldo en cuenta origen
                await Cuenta.findByIdAndUpdate({ _id: cuenta._id }, {
                    saldo: Number(cuenta.saldo) - Number(data.monto),
                });
                if (data.cbuDestino != "") {
                    //Actualizo saldo en cuenta destino, dependiendo de si no es un 'retiro'
                    await Cuenta.findByIdAndUpdate({ _id: data.cbuDestino }, {
                        saldo: Number(ctaDestino.saldo) + Number(data.monto),
                    });
                }
            }
            var reg = await Movimiento.create(data);
            res.status(200).send({ data: reg });
        }
        else {
            fsHelper.add_log("MovimientoController.registro_movimiento", msjValidacion);
            res.status(500).send({ message: msjValidacion });
        }

    } catch (error) {
        fsHelper.add_log("MovimientoController.registro_movimiento", "ServerError: " + error.message);
        res.status(500).send({ message: 'ServerError: Posiblemente falten datos' });
    }
}

const obtener_movimientos_cuenta_principal = async function (req, res) {
    if (req.user) {
        let cliente_id = req.params["idCliente"];
        let cuenta = await Cuenta.findOne({ cliente: cliente_id, principal: true });
        let movimientos = await Movimiento.find({
            $or: [
                { cuenta: cuenta._id },
                { cbuDestino: cuenta.cbu }
            ]
        }).limit(5);
        if(movimientos.length > 0){
            movimientos.forEach(e=>{
                if(e.cbuDestino === cuenta.cbu){
                    e.recibida = true;
                }
                else{
                    e.recibida = false;
                }
            });
        }
        res.status(200).send({ data: movimientos });
    } else {
        fsHelper.add_log("ClienteController.js", "Hubo un error en ClienteController.listar_clientes_filtro_admin");
        res.status(500).send({ message: 'NoAccess' })
    }
}

const obtener_movimientos_cuenta_id = async function (req, res) {
    if (req.user) {
        let idCuenta = req.params["idCuenta"];
        let cuenta = await Cuenta.findOne({ _id: idCuenta });
        let movimientos = await Movimiento.find({
            $or: [
                { cuenta: cuenta._id },
                { cbuDestino: cuenta.cbu }
            ]
        }).limit(50);
        if(movimientos.length > 0){
            movimientos.forEach(e=>{
                if(e.cbuDestino === cuenta.cbu){
                    e.recibida = true;
                }
                else{
                    e.recibida = false;
                }
            });
        }
        res.status(200).send({ data: movimientos });
    } else {
        fsHelper.add_log("ClienteController.js", "Hubo un error en ClienteController.listar_clientes_filtro_admin");
        res.status(500).send({ message: 'NoAccess' })
    }
}

const obtener_movimientos_transferencias = async function (req, res) {
    if (req.user) {
        //TODO: Hacer prueba agregando array de movimiento a cuenta.
        let movimientos = await Movimiento.find({
            $or: [
                { tipo: new RegExp(tipoMovimiento.tipoMovimiento.PROPIA, 'i') },
                { tipo: new RegExp(tipoMovimiento.tipoMovimiento.TERCEROS, 'i') }
            ]
        }).limit(10);
        res.status(200).send({ data: movimientos });
    } else {
        fsHelper.add_log("ClienteController.js", "Hubo un error en ClienteController.listar_clientes_filtro_admin");
        res.status(500).send({ message: 'NoAccess' })
    }
}

const transferir = async function (req, res) {
    if (req.user) {
        var data = req.body;
        try {
            //Seteo las variables que no se solicitan en el front
            data.isIngreso = false;
            if (data.tipo == tipoMovimiento.tipoMovimiento.TERCEROS) data.descripcion = "Transferencia a terceros";
            else data.descripcion = "Transferencia a cuenta propia";

            //Voy a buscar la información de la cuenta origen
            var cuentaOrigen = await Cuenta.findById({ _id: data.cuenta });
            var msjValidacion = await validateData(data, cuentaOrigen);
            if (Object.keys(msjValidacion).length === 0) {
                var ctaDestino = await Cuenta.findOne({ cbu: data.cbuDestino });
                await Cuenta.findByIdAndUpdate({ _id: ctaDestino._id }, {
                    saldo: Number(ctaDestino.saldo) + Number(data.monto),
                });
                await Cuenta.findByIdAndUpdate({ _id: cuentaOrigen._id }, {
                    saldo: Number(cuentaOrigen.saldo) - Number(data.monto),
                });
                var reg = await Movimiento.create(data);
                res.status(200).send({ data: reg });
            }
            else {
                fsHelper.add_log("CuentaController.transferir", msjValidacion);
                res.status(400).send({ message: msjValidacion, data: undefined });
            }
        } catch (error) {
            fsHelper.add_log("CuentaController.transferir", msjValidacion);
            res.status(500).send({ message: msjValidacion, data: undefined });
        }
    }
    else {
        fsHelper.add_log("CuentaController.transferir", "Usuario no identificado");
        res.status(500).send({ message: 'NoAccess: Usuario no identificado', data: undefined });
    }
}

async function validateData(data, cuenta) {
    var msj = {
    };
    //Valido la cuenta origen
    if (cuenta == undefined) {
        msj.cuenta = "Número de cuenta origen incorrecto, favor de verificar.";
    }
    //Valido el tipo
    if (data.tipo != undefined && data.tipo != null && data.tipo != "") {
        if (data.tipo.toUpperCase() != tipoMovimiento.tipoMovimiento.TERCEROS &&
            data.tipo.toUpperCase() != tipoMovimiento.tipoMovimiento.PROPIA &&
            data.tipo.toUpperCase() != tipoMovimiento.tipoMovimiento.DEPOSITO &&
            data.tipo.toUpperCase() != tipoMovimiento.tipoMovimiento.RETIRO) {
            msj.tipo = "Tipo de movimiento incorrecto, favor de verificar.";
        }
        else if (data.tipo.toUpperCase() == tipoMovimiento.tipoMovimiento.TERCEROS) {
            if (data.cbuDestino == undefined || data.cbuDestino == null || data.cbuDestino == "") {
                msj.cbuDestino = "Al ser una transferencia es necesario el CBU destino.";
            } else {
                if (data.cbuDestino.length == 22) {
                    var cuentaDestino = await Cuenta.findOne({ cbu: data.cbuDestino });
                    if (cuentaDestino == undefined) {
                        msj.cbuDestino = "No existe el cbu ingresado, favor de verificar.";
                    }
                    else if (cuentaDestino.cliente.equals(cuenta.cliente)) {
                        msj.cbuDestino = "El cbu al que intenta enviar es propio, favor de verificar.";
                    }
                    else if (cuentaDestino.cbu == cuenta.cbu) {
                        msj.cbuDestino = "El cbu al que intenta enviar es el mismo que la cuenta origen, favor de verificar.";
                    }
                }
                else {
                    msj.cbuDestino = "El cbu debe contener 22 números, favor de verificar.";
                }
            }
        }
        else if (data.tipo.toUpperCase() == tipoMovimiento.tipoMovimiento.PROPIA) {
            if (data.cbuDestino == undefined || data.cbuDestino == null || data.cbuDestino == "") {
                msj.cbuDestino = "Al ser una transferencia es necesario el CBU destino.";
            } else {
                if (data.cbuDestino.length == 22) {
                    var cuentaDestino = await Cuenta.findOne({ cbu: data.cbuDestino });
                    if (cuentaDestino == undefined) {
                        msj.cbuDestino = "No existe el cbu ingresado, favor de verificar.";
                    }
                    else if (!cuentaDestino.cliente.equals(cuenta.cliente)) {
                        msj.cbuDestino = "El cbu al que intenta enviar no es propio, favor de verificar.";
                    }
                    else if (cuentaDestino.cbu == cuenta.cbu) {
                        msj.cbuDestino = "El cbu al que intenta enviar es el mismo que la cuenta origen, favor de verificar.";
                    }
                }
                else {
                    msj.cbuDestino = "El cbu debe contener 22 números, favor de verificar.";
                }
            }
        }
    }
    else {
        msj.tipo = "El tipo es requerido.";
    }
    if (data.descripcion == undefined || data.descripcion == null || data.descripcion == "") {
        msj.descripcion = "La descripción es requerida.";
    }
    if (data.monto != undefined && data.monto != null && data.monto != "") {
        if (data.isIngreso === undefined || data.isIngreso === null || data.isIngreso === "") {
            msj.isIngreso = "Es necesario determinar si es un ingreso o un egreso de dinero.";
        }
        else {
            if (data.isIngreso.toString().toLowerCase() != "true" && data.isIngreso.toString().toLowerCase() != "false") {
                msj.isIngreso = "El campo isIngreso debe ser un booleano, favor de verificar.";
            }
            if (isNaN(Number(data.monto))) {
                msj.monto = "El monto ingresado no es un número, favor de verificar.";
            }
            else if (!(data.isIngreso.toString().toLowerCase() === 'true')) {
                if (Number(cuenta.saldo) < Number(data.monto)) {
                    msj.monto = "El monto que esta intentando transferir es superior a lo que hay en la cuenta.";
                }
            }
        }
    }
    else {
        msj.monto = "El monto es requerido.";
    }
    return msj;
}

module.exports = {
    registro_movimiento,
    obtener_movimientos_cuenta_principal,
    obtener_movimientos_cuenta_id,
    obtener_movimientos_transferencias,
    transferir
}
