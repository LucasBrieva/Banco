'use strict'

var express = require("express");
var clienteController = require("../controllers/ClienteController");

var api = express.Router();
var auth = require("../middlewares/authenticate");

api.post('/registro_cliente', clienteController.registro_cliente);
api.post('/login_cliente', clienteController.login_cliente);
api.get('/obtener_cliente_id/:id', auth.auth, clienteController.obtener_cliente_id);

module.exports = api;
