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
  describe('#obtener_cuenta_principal_cliente', function () {
    beforeEach(function () {
      sinon.restore();
    });
    it('debería devolver un arreglo de cuentas principales si el usuario está autenticado', async function () {
      const clienteId = '60918ec465c98f001db838f1';
      const req = {
        params: { clienteId: clienteId },
        user: { _id: '60918ec465c98f001db838f2' }
      };
      const res = {
        status: function (code) {
          assert.equal(code, 200);
          return this;
        },
        send: function (response) {
          assert(Array.isArray(response.data));
        }
      };

      sinon.stub(Cuenta, 'find').returns([{ principal: true }, { principal: true }]);

      await controller.obtener_cuenta_principal_cliente(req, res);
    });

    it('debería retornar un mensaje de error si el usuario no está autenticado', async function () {
      const req = {
        params: { clienteId: '60918ec465c98f001db838f1' },
      };
      const res = {
        status: function (code) {
          assert.equal(code, 500);
          return this;
        },
        send: function (response) {
          assert.equal(response.message, 'NoAccess: Usuario no identificado');
        }
      };

      await controller.obtener_cuenta_principal_cliente(req, res);
    });
  });
  describe('#obtener_cuentas_cliente', function () {
    beforeEach(function () {
      sinon.restore();
    });
    it('debería devolver las cuentas de un cliente si el usuario está autenticado', async function () {
      const clienteId = '60918ec465c98f001db838f1';
      const cuentas = [
        {
          _id: '1234567890',
          cliente: clienteId,
          numero: '123456',
          tipo: 'ahorro',
          saldo: 1000
        },
        {
          _id: '0987654321',
          cliente: clienteId,
          numero: '654321',
          tipo: 'corriente',
          saldo: 5000
        }
      ];
      const req = {
        params: { clienteId },
        user: { _id: '60918ec465c98f001db838f2' }
      };
      const res = {
        status: function (code) {
          assert.equal(code, 200);
          return this;
        },
        send: function (response) {
          assert(Array.isArray(response.data));
          assert.equal(response.data.length, 2);
          assert.deepEqual(response.data, cuentas);
        }
      };
      sinon.stub(Cuenta, 'find').returns(cuentas);

      await controller.obtener_cuentas_cliente(req, res);
    });
    it('debería retornar un mensaje de error al no estar el usuario identificado', function (done) {
      const req = {
        params: { clienteId: '123' }
      };
      const res = {
        status: function (code) {
          assert.equal(code, 500);
          return this;
        },
        send: function (response) {
          assert.equal(response.message, 'NoAccess: Usuario no identificado');
          done();
        }
      };

      controller.obtener_cuentas_cliente(req, res);
    });
  });
  describe('obtener_detalle_cuenta', () => {
    it('debería devolver los detalles de una cuenta si el usuario está autenticado y se proporciona un ID válido', async function () {
      const idCuenta = '60918ec465c98f001db838f1';
      const cuenta = {
        _id: idCuenta,
        cliente: '60918ec465c98f001db838f2',
        numero: '123456',
        tipo: 'ahorro',
        saldo: 1000
      };
      const req = {
        params: { id: idCuenta },
        user: { _id: '60918ec465c98f001db838f2' }
      };
      const res = {
        status: function (code) {
          assert.equal(code, 200);
          return this;
        },
        send: function (response) {
          assert(response.data);
          assert.deepEqual(response.data, cuenta);
        }
      };
      sinon.stub(Cuenta, 'findById').returns({
        populate: sinon.stub().returns(cuenta)
      });

      await controller.obtener_detalle_cuenta(req, res);
    });

    it('debería retornar un mensaje de error al no estar el usuario identificado', function (done) {
      const req = {
        params: { id: '123' }
      };
      const res = {
        status: function (code) {
          assert.equal(code, 500);
          return this;
        },
        send: function (response) {
          assert.equal(response.message, 'NoAccess: Usuario no identificado');
          done();
        }
      };

      controller.obtener_detalle_cuenta(req, res);
    });

  });
  describe('#crear_cuenta', function () {
    beforeEach(function () {
        sinon.restore();
    });
    it('debería crear una nueva cuenta si no hay otra cuenta de ese tipo para ese cliente', async function () {
        const data = {
            cliente: '60918ec465c98f001db838f1',
            tipo: 'ahorro',
            saldo: 1000,
            principal: true
        };
        const cuentas = [];
        const req = {
            body: data,
            user: { _id: '60918ec465c98f001db838f2' }
        };
        const res = {
            status: function (code) {
                assert.equal(code, 200);
                return this;
            },
            send: function (response) {
                assert.property(response.data, '_id');
                assert.equal(response.data.cliente, data.cliente);
                assert.equal(response.data.tipo, data.tipo);
                assert.equal(response.data.saldo, data.saldo);
                assert.equal(response.data.principal, data.principal);
            }
        };
        sinon.stub(Cuenta, 'findOne').returns(null);
        sinon.stub(Cuenta, 'find').returns(cuentas);
        sinon.stub(Cuenta, 'create').returns(data);

        await controller.crear_cuenta(req, res);
    });
    it('debería devolver error 500 si el usuario no está identificado', async function () {
      const req = { user: null };
      const res = {
        status: function (code) {
          assert.equal(code, 500);
          return this;
        },
        send: function (response) {
          assert.equal(response.message, 'NoAccess: Usuario no identificado');
        },
      };
      await controller.crear_cuenta(req, res);
    });
  });
  describe('cambiar_cuenta_principal', function () {
    it('debería devolver error 500 si no hay usuario identificado', async function () {
      const req = { user: null };
      const res = {
        status: function (code) {
          assert.equal(code, 500);
          return this;
        },
        send: function (response) {
          assert.equal(response.message, 'NoAccess: Usuario no identificado');
        },
      };
      await controller.cambiar_cuenta_principal(req, res);
    });
  });
  
});
