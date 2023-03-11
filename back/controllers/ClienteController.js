'use strict'

var Cliente = require('../models/cliente');
var Direccion = require('../models/direccion');
var bcrypt = require('bcrypt-nodejs');
var jwt = require('../helpers/jwt');
var fsHelper = require('../helpers/fsHelper');

const registro_cliente = async function (req, res) {
    var data = req.body;
    var clientes_arr = [];
    clientes_arr = await Cliente.find({ email: data.email });
    if (clientes_arr.length == 0) {
        if (data.password) {
            bcrypt.hash(data.password, null, null, async function (err, hash) {
                if (hash) {
                    data.password = hash;
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

module.exports = {
    registro_cliente
}
