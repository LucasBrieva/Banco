'use strict'

var Cliente = require('../models/cliente');
var Direccion = require('../models/direccion');
var bcrypt = require('bcrypt-nodejs');
var jwt = require('../helpers/jwt');
var fsHelper = require('../helpers/fsHelper');

const registro_cliente = async function (req, res) {
    var data = req.body;
    var clientes_arr = [];
    data.email = data.email.toLowerCase();
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

const login_cliente = async function (req, res) {
    var data = req.body;
    var cliente_arr = [];

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

module.exports = {
    registro_cliente,
    login_cliente
}
