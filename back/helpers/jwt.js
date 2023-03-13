'use strict'

var jwt = require('jwt-simple');
var moment = require('moment');
var secret = 'lucasbrieva';

exports.createToken = function(user){
    var payload = {
        sub:user._id,
        nombres: user.nombres,
        apellidos: user.apellidos,
        email: user.email,
        role: user.tipo,
        iat: moment().unix(),
        exp: moment().add(1,'hours').unix()
    };

    return jwt.encode(payload, secret);
}