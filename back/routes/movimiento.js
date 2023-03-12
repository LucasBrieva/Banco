'use strict'

var express = require("express");
var movimientoController = require("../controllers/MovimientoController");

var api = express.Router();
var auth = require("../middlewares/authenticate");

api.post('/registro_movimiento', movimientoController.registro_movimiento);
api.get('/obtener_movimientos_cuenta_principal/:idCliente', auth.auth, movimientoController.obtener_movimientos_cuenta_principal);

module.exports = api;