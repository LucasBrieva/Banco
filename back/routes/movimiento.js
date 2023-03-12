'use strict'

var express = require("express");
var movimientoController = require("../controllers/MovimientoController");

var api = express.Router();
var auth = require("../middlewares/authenticate");

api.post('/registro_movimiento', movimientoController.registro_movimiento);

module.exports = api;
