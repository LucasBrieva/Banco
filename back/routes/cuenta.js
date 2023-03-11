'use strict'

var express = require("express");
var cuentaController = require("../controllers/CuentaController");

var api = express.Router();
var auth = require("../middlewares/authenticate");

api.post('/registro_cuenta', cuentaController.registro_cuenta);
api.get('/obtener_cuenta_principal_cliente/:clienteId', auth.auth, cuentaController.obtener_cuenta_principal_cliente);

module.exports = api;
