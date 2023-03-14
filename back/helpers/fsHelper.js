'use strict'

var fs = require('file-system');
var moment = require('moment');
var dateNow = moment().format("DD_MM_yyyy");
var path = "C:/Banco/logs/" + dateNow + ".txt";

const add_log = async function (from, message) {
    var msj = moment().hour() + ":" + moment().minutes() + " - Mensaje proveniente de " + from + ": " + message;
    if (fs.fs.existsSync(path)) {
        fs.fs.appendFile(path, msj + "\n", (error) => {
        });
    } else {
        fs.writeFile(path, msj + "\n");
    }
}
const add_log_array = async function (from, message) {
    message.forEach(element => {
        var msj = moment().hour() + ":" + moment().minutes() + " - Mensaje proveniente de " + from + ": " + element;
        if (fs.fs.existsSync(path)) {
            fs.fs.appendFile(path, msj + "\n", (error) => {
            });
        } else {
            fs.writeFile(path, msj + "\n");
        }
    });

}

module.exports = {
    add_log,
    add_log_array
};