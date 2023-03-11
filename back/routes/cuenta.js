'use strict'

var express = require("express");
var cuentaController = require("../controllers/CuentaController");

var api = express.Router();
var auth = require("../middlewares/authenticate");

api.post('/registro_cuenta', cuentaController.registro_cuenta);

module.exports = api;
