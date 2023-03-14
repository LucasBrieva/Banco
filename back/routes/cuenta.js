'use strict'

var express = require("express");
var cuentaController = require("../controllers/CuentaController");

var api = express.Router();
var auth = require("../middlewares/authenticate");

api.post('/registro_cuenta', cuentaController.registro_cuenta);
api.get('/obtener_cuenta_principal_cliente/:clienteId', auth.auth, cuentaController.obtener_cuenta_principal_cliente);
api.get('/obtener_cuentas_cliente/:clienteId', auth.auth, cuentaController.obtener_cuentas_cliente);
api.get('/obtener_detalle_cuenta/:id', auth.auth, cuentaController.obtener_detalle_cuenta);
api.get('/cambiar_cuenta_principal/:id/:clienteId', auth.auth, cuentaController.cambiar_cuenta_principal);
api.post('/crear_cuenta', auth.auth, cuentaController.crear_cuenta);

module.exports = api;
