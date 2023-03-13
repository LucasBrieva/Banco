'use strict'

var express = require("express");
var movimientoController = require("../controllers/MovimientoController");

var api = express.Router();
var auth = require("../middlewares/authenticate");

api.post('/registro_movimiento', movimientoController.registro_movimiento);
api.get('/obtener_movimientos_cuenta_principal/:idCliente', auth.auth, movimientoController.obtener_movimientos_cuenta_principal);
api.get('/obtener_movimientos_cuenta_id/:idCuenta', auth.auth, movimientoController.obtener_movimientos_cuenta_id);
api.get('/obtener_movimientos_transferencias', auth.auth, movimientoController.obtener_movimientos_transferencias);
api.get('/obtener_movimientos_dep_ret', auth.auth, movimientoController.obtener_movimientos_dep_ret);
api.post('/transferir', auth.auth, movimientoController.transferir);
api.post('/crear_deposito_retiro', auth.auth, movimientoController.crear_deposito_retiro);

module.exports = api;
