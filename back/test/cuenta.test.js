const assert = require('assert');
const sinon = require('sinon');
const bcrypt = require('bcrypt-nodejs');

const Cuenta = require('../models/cuenta');
const controller = require('../controllers/cuentaController');

describe('CuentaController', function () {
  describe('#registro_cuenta', function (done) {
    beforeEach(function () {
      sinon.restore();
    });

    it('Debe crear una nueva cuenta si los datos son válidos y el cliente no tiene una cuenta del mismo tipo', async function () {
      const req = {
        body: {
          tipo: 'cc',
          cbu: '1234567890123456789012',
          alias: 'mi cuenta',
          descubierto: 5000,
          nroCuenta: '1234567890',
          cliente: '1234567890',
          principal: true
        }
      };
      const res = {
        status: function (code) {
          assert.equal(code, 200);
          return this;
        },
        send: function (response) {
          assert.ok(response.data);
          done();
        }
      };
      sinon.stub(Cuenta, 'find').returns([]);
      sinon.stub(Cuenta, 'create').returns(req.body);

      controller.registro_cuenta(req, res);
    });
    it('Debe retornar un error 400 si los datos ingresados son incorrectos', async function (done) {
      const req = {
        body: {
          tipo: '',
          cbu: '',
          alias: '',
          descubierto: '',
          nroCuenta: '',
          cliente: '',
          principal: ''
        }
      };
      const res = {
        status: function (code) {
          assert.equal(code, 400);
          return this;
        },
        send: function (response) {
          assert.equal(response.message, 'Datos ingresados incorrectos');
          assert.equal(response.data, undefined);
          done();
        }
      };

      await controller.registro_cuenta(req, res);
    });
    it('Debe retornar un error 400 si el cliente ya tiene una cuenta de ese tipo', function () {
      const req = {
        body: {
          tipo: 'cc',
          cbu: '123456',
          alias: 'Cuenta Corriente',
          descubierto: 5000,
          nroCuenta: '11111',
          cliente: 'cliente_id',
          principal: true
        }
      };
      const res = {
        status: function (code) {
          assert.equal(code, 400);
          return this;
        },
        send: function (response) {
          assert.equal(response.message, 'El cliente ya tiene una cuenta de este tipo');
          assert.equal(response.data, undefined);
        }
      };
      sinon.stub(Cuenta, 'find').returns([{ tipo: 'cc' }]);

      controller.registro_cuenta(req, res);
    });
    it('Debe retornar un error 400 si la cuenta no puede tener cierto tipo de cuenta y el cliente es normal', function () {
      const req = {
        body: {
          tipo: 'cc',
          cbu: '123456',
          alias: 'Cuenta Corriente',
          descubierto: 5000,
          nroCuenta: '11111',
          cliente: 'cliente_id',
          principal: true
        }
      };
      const res = {
        status: function (code) {
          assert.equal(code, 400);
          return this;
        },
        send: function (response) {
          assert.equal(response.message, 'La cuenta no puede tener dichas cuentas, actualice a VIP');
          assert.equal(response.data, undefined);
        }
      };
      sinon.stub(Cuenta, 'findOne').returns({ tipo: 'normal' });

      controller.registro_cuenta(req, res);
    });
    it('Debe retornar un error 400 si falta algún campo requerido', function () {
      const req = {
        body: {
          tipo: 'cc',
          cbu: '',
          alias: 'Cuenta Corriente',
          descubierto: 5000,
          nroCuenta: '11111',
          cliente: 'cliente_id',
          principal: true
        }
      };
      const res = {
        status: function (code) {
          assert.equal(code, 400);
          return this;
        },
        send: function (response) {
          assert.equal(response.message, 'Faltan campos requeridos');
          assert.equal(response.data, undefined);
        }
      };

      controller.registro_cuenta(req, res);
    });
    it('Debe retornar un error 500 si hay un error en la base de datos', function () {
      const req = {
        body: {
          tipo: 'cc',
          cbu: '123456',
          alias: 'Cuenta Corriente',
          descubierto: 5000,
          nroCuenta: '11111',
          cliente: 'cliente_id',
          principal: true
        }
      };
      const res = {
        status: function (code) {
          assert.equal(code, 500);
          return this;
        },
        send: function (response) {
          assert.equal(response.message, 'Error al guardar la cuenta');
          assert.equal(response.data, undefined);
          done();
        }
      };
      sinon.stub(Cuenta.prototype, 'save').rejects();

      controller.registro_cuenta(req, res);
    });
  });

});
