'use strict'

var Cliente = require('../models/cliente');
var Cuenta = require('../models/cuenta');
var Movimiento = require('../models/movimiento');
var bcrypt = require('bcrypt-nodejs');
var jwt = require('../helpers/jwt');
var fsHelper = require('../helpers/fsHelper');

const registro_cliente = async function (req, res) {
    var data = req.body;
    if (data) {
        var clientes_arr = [];
        data.email = data.email.toLowerCase();
        if (data.email.includes("@") && data.email.includes(".")) {
            clientes_arr = await Cliente.find({ email: data.email });
            if (clientes_arr.length == 0) {
                if (data.password) {
                    bcrypt.hash(data.password, null, null, async function (err, hash) {
                        if (hash) {
                            data.password = hash;
                            data.tipo = data.tipo.toLowerCase();
                            var reg = await Cliente.create(data);
                            res.status(200).send({
                                data: reg,
                                token: jwt.createToken(reg)
                            });
                        }
                        else {
                            fsHelper.add_log("ClienteController.registro_cliente", "Error al hacer el hash de la pass");

                            res.status(500).send({ message: 'ErrorServer', data: undefined });
                        }
                    });
                } else {
                    fsHelper.add_log("ClienteController.registro_cliente", "No hay una contraseña");
                    res.status(400).send({ message: 'No hay una contraseña', data: undefined });
                }
            }
            else {
                fsHelper.add_log("ClienteController.registro_cliente", "El correo ya existe en la base de datos");
                res.status(400).send({ message: 'El correo ya existe en la base de datos', data: undefined });
            }
        }
        else {
            fsHelper.add_log("ClienteController.registro_cliente", "Debe ingresar un correo valido");
            res.status(400).send({ message: 'Debe ingresar un correo valido', data: undefined });
        }
    }
    else {
        fsHelper.add_log("ClienteController.registro_cliente", "Datos invalidos");
        res.status(400).send({ message: 'Datos invalidos', data: undefined });
    }
}

const login_cliente = async function (req, res) {
    var data = req.body;
    var cliente_arr = [];
    if(data.password){
        cliente_arr = await Cliente.find({ email: data.email });
        if (cliente_arr.length == 0) {
            res.status(400).send({ message: "No se encontró el correo", data: undefined });
    
        } else {
            let user = cliente_arr[0];
    
            bcrypt.compare(data.password, user.password, async function (error, check) {
                if (check) {
                    if (user.dadoBaja == "false") {
                        res.status(200).send({
                            data: user,
                            token: jwt.createToken(user)
                        });
                    }
                    else {
                        res.status(400).send({ message: "El usuario está dado de baja", data: undefined });
                    }
                }
                else {
                    res.status(400).send({ message: "La contraseña no coincide", data: undefined });
                }
            });
    
        }
    }
    else{
        res.status(400).send({ message: "No se proporcionó la contraseña", data: undefined });
    }
}

const obtener_cliente_id = async function (req, res) {
    if (req.user) {
        var id = req.params['id'];
        var cliente = await Cliente.findById({ _id: id });
        if(cliente){
            res.status(200).send({ data: cliente });
        }else{
            fsHelper.add_log("ClienteController.obtener_cliente_id", "No se encontro el usuario");
            res.status(400).send({ message: "No se encontro el usuario" });
        }
    } else {
        fsHelper.add_log("ClienteController.obtener_cliente_id", "Usuario no identificado");
        res.status(500).send({ message: 'NoAccess: Usuario no identificado' })
    }
}
const actualizar_cliente_vip = async function (req, res) {
    if (req.user) {
        var clienteId = req.params['clienteId'];
        var cuentaId = req.params['cuentaId'];
        var cuenta = await Cuenta.findOne({ _id: cuentaId });
        if (Number(cuenta.saldo) > 150) {
            await Cuenta.findByIdAndUpdate({ _id: cuentaId }, { saldo: Number(cuenta.saldo) - 150 });
            await Movimiento.create({
                cuenta: cuentaId,
                tipo: "R",
                monto: 150,
                descripcion: "Ser VIP",
                isIngreso: false
            })
            await Cliente.findByIdAndUpdate({ _id: clienteId }, { tipo: "vip" });
            res.status(200).send({ message: "Bienvenido a los vips" });
        }
        else{
            fsHelper.add_log("ClienteController.actualizar_cliente_vip", "Dinero insuficiente");
            res.status(400).send({ message: 'Dinero insuficiente' });
        }
    } else {
        fsHelper.add_log("ClienteController.actualizar_cliente_vip", "Usuario no identificado");
        res.status(500).send({ message: 'NoAccess: Usuario no identificado' });
    }
}
module.exports = {
    registro_cliente,
    login_cliente,
    obtener_cliente_id,
    actualizar_cliente_vip
}
