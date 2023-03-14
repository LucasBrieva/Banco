const assert = require('assert');
const sinon = require('sinon');
const bcrypt = require('bcrypt-nodejs');

const Cliente = require('../models/cliente');
const Cuenta = require('../models/cuenta');
const Movimiento = require('../models/movimiento');
const fsHelper = require('../helpers/fsHelper');
const controller = require('../controllers/clienteController');

describe('ClienteController', function () {
  describe('#registro_cliente', function () {
    beforeEach(function () {
      sinon.restore();
    });
    it('Debe crear un nuevo cliente si el correo electrónico no existe y se proporciona la contraseña', async function () {
      const req = {
        body: {
          email: 'newclient@test.com',
          password: '1234',
          tipo: 'normal',
          nombres: 'new',
          apellidos: 'client',
          pais: 'Argentina',
          telefono: '22222222',
          f_nacimiento: '22/06/1996',
          dni: '39664602'
        }
      };
      const res = {
        status: function (code) {
          assert.equal(code, 200);
          return this;
        },
        send: function (response) {
          assert.ok(response.data);
          assert.ok(response.token);
          done();
        }
      };
      sinon.stub(Cliente, 'find').returns([]);
      sinon.stub(bcrypt, 'hash').yields(null, 'hash');
      sinon.stub(Cliente, 'create').returns({
        email: req.body.email,
        tipo: req.body.tipo,
        nombres: 'new',
        apellidos: 'client',
        pais: 'Argentina',
        telefono: '22222222',
        f_nacimiento: '22/06/1996',
        dni: '39664602'
      });

      await controller.registro_cliente(req, res);
    });
    it('Debe devolver un error si ocurre un error al hacer el hash de la contraseña', async function () {
      const req = {
        body: {
          email: 'newclient@test.com',
          password: '1234',
          tipo: 'normal',
          nombres: 'new',
          apellidos: 'client',
          pais: 'Argentina',
          telefono: '22222222',
          f_nacimiento: '22/06/1996',
          dni: '39664602'
        }
      };
      const res = {
        status: function (code) {
          assert.equal(code, 500);
          return this;
        },
        send: function (response) {
          assert.equal(response.message, 'Error al hacer el hash de la pass');
          done();
        }
      };
      sinon.stub(Cliente, 'find').returns([]);
      sinon.stub(bcrypt, 'hash').yields(new Error('Error al hacer el hash de la pass'));
      sinon.stub(Cliente, 'create').returns({
        email: req.body.email,
        tipo: req.body.tipo,
        nombres: 'new',
        apellidos: 'client',
        pais: 'Argentina',
        telefono: '22222222',
        f_nacimiento: '22/06/1996',
        dni: '39664602'
      });

      await controller.registro_cliente(req, res);
    });
    it('Debería devolver un error si el correo electrónico ya existe', function (done) {
      const req = {
        body: {
          email: 'existe@gmail.com',
          password: '1234',
          tipo: 'normal',
          nombres: 'new',
          apellidos: 'client',
          pais: 'Argentina',
          telefono: '22222222',
          f_nacimiento: '22/06/1996',
          dni: '39664602'
        }
      };
      const res = {
        status: function (code) {
          assert.equal(code, 400);
          return this;
        },
        send: function (response) {
          assert.equal(response.message, 'El correo ya existe en la base de datos');
          assert.equal(response.data, undefined);
          done();
        }
      };
      sinon.stub(Cliente, 'find').returns([{ email: req.body.email }]);

      controller.registro_cliente(req, res);
    });
    it('Debería devolver un error si la contraseña no se envía', function (done) {
      const req = {
        body: {
          email: 'newclient@test.com',
          tipo: 'normal',
          nombres: 'new',
          apellidos: 'client',
          pais: 'Argentina',
          telefono: '22222222',
          f_nacimiento: '22/06/1996',
          dni: '39664602'
        }
      };
      const res = {
        status: function (code) {
          assert.equal(code, 400);
          return this;
        },
        send: function (response) {
          assert.equal(response.message, 'No hay una contraseña');
          assert.equal(response.data, undefined);
          done();
        }
      };
      sinon.stub(Cliente, 'find').returns([]);

      controller.registro_cliente(req, res);
    });
    it('Debería devolver un error si el correo no es válido', async function (done) {
      const req = {
        body: {
          email: 'newclient',
          password: '1234',
          tipo: 'normal',
          nombres: 'new',
          apellidos: 'client',
          pais: 'Argentina',
          telefono: '22222222',
          f_nacimiento: '22/06/1996',
          dni: '39664602'
        }
      };
      const res = {
        status: function (code) {
          assert.equal(code, 400);
          return this;
        },
        send: function (response) {
          assert.equal(response.message, 'Debe ingresar un correo valido');
          assert.equal(response.data, undefined);
          done();
        }
      };
      sinon.stub(Cliente, 'find').returns([]);

      await controller.registro_cliente(req, res);
    });
    it('Debería devolver un error si no se envía data', async function (done) {
      const req = {
      };
      const res = {
        status: function (code) {
          assert.equal(code, 400);
          return this;
        },
        send: function (response) {
          assert.equal(response.message, 'Datos invalidos');
          assert.equal(response.data, undefined);
          done();
        }
      };
      sinon.stub(Cliente, 'find').returns([]);

      await controller.registro_cliente(req, res);
    });
  });
  describe('#login_cliente', function () {
    beforeEach(function () {
      sinon.restore();
    });
    it('Debe iniciar sesión correctamente si el correo electrónico y la contraseña son válidos', function (done) {
      const req = {
        body: {
          email: 'test@test.com',
          password: '1234'
        }
      };
      const res = {
        status: function (code) {
          assert.equal(code, 200);
          return this;
        },
        send: function (response) {
          assert.ok(response.data);
          assert.ok(response.token);
          done();
        }
      };

      const user = {
        email: 'test@test.com',
        password: 'hash',
        tipo: 'normal',
        nombres: 'test',
        apellidos: 'test',
        pais: 'Argentina',
        telefono: '11111111',
        f_nacimiento: '01/01/2000',
        dni: '12345678',
        dadoBaja: 'false'
      };
      sinon.stub(Cliente, 'find').returns([user]);
      sinon.stub(bcrypt, 'compare').yields(null, true);

      controller.login_cliente(req, res);
    });
    it('Debería devolver un error cuando no se proporcione el correo electrónico', async function () {
      const req = {
        body: {
          password: '1234'
        }
      };
      const res = {
        status: function (code) {
          assert.equal(code, 400);
          return this;
        },
        send: function (response) {
          assert.equal(response.message, 'No se proporcionó el correo electrónico');
          assert.equal(response.data, undefined);
          done();
        }
      };

      controller.login_cliente(req, res);
    });
    it('Debería devolver un error cuando no se proporcione la contraseña', function (done) {
      const req = {
        body: {
          email: 'test@test.com'
        }
      };
      const res = {
        status: function (code) {
          assert.equal(code, 400);
          return this;
        },
        send: function (response) {
          assert.equal(response.message, 'No se proporcionó la contraseña');
          assert.equal(response.data, undefined);
          done();
        }
      };

      controller.login_cliente(req, res);
    });
    it('Debería devolver un error cuando el correo electrónico no existe', function (done) {
      const req = {
        body: {
          email: 'nonexistent@test.com',
          password: '1234'
        }
      };
      const res = {
        status: function (code) {
          assert.equal(code, 400);
          return this;
        },
        send: function (response) {
          assert.equal(response.message, 'No se encontró el correo');
          assert.equal(response.data, undefined);
          done();
        }
      };
      sinon.stub(Cliente, 'find').returns([]);

      controller.login_cliente(req, res);
    });
    it('Debería devolver un error cuando la contraseña no coincide', async function () {
      const req = {
        body: {
          email: 'test@test.com',
          password: 'wrongpassword'
        }
      };
      const res = {
        status: function (code) {
          assert.equal(code, 400);
          return this;
        },
        send: function (response) {
          assert.equal(response.message, 'La contraseña no coincide');
          assert.equal(response.data, undefined);
          done();
        }
      };
      sinon.stub(Cliente, 'find').returns([{
        email: 'test@test.com',
        password: 'hashedpassword',
        dadoBaja: false
      }]);
      sinon.stub(bcrypt, 'compare').yields(null, false);

      await controller.login_cliente(req, res);
    });
    it('Debería devolver un error si el usuario está dado de baja', async function () {
      const req = {
        body: {
          email: 'client1@test.com',
          password: '1234'
        }
      };
      const res = {
        status: function (code) {
          assert.equal(code, 400);
          return this;
        },
        send: function (response) {
          assert.equal(response.message, 'El usuario está dado de baja');
          assert.equal(response.data, undefined);
          done();
        }
      };
      sinon.stub(Cliente, 'find').returns([{ email: req.body.email, password: 'hash', dadoBaja: true }]);

      await controller.login_cliente(req, res);
    });
  });
  describe('#obtener_cliente_id', function () {
    beforeEach(function () {
      sinon.restore();
    });
    it('debería devolver un cliente si el usuario está autenticado y se proporciona un ID válido', async function () {
      const id = '60918ec465c98f001db838f1';
      const req = {
        params: { id: id },
        user: { _id: '60918ec465c98f001db838f2' }
      };
      const res = {
        status: function (code) {
          assert.equal(code, 200);
          return this;
        },
        send: function (response) {
          assert.ok(response.data);
        }
      };
      sinon.stub(Cliente, 'findById').returns({
        _id: id,
        email: 'test@test.com',
        tipo: 'normal',
        nombres: 'Test',
        apellidos: 'Cliente',
        pais: 'Argentina',
        telefono: '11111111',
        f_nacimiento: '01/01/1990',
        dni: '12345678'
      });

      await controller.obtener_cliente_id(req, res);
    });
    it('Debe retornar un mensaje de error al no encontrar el usuario', async function () {
      const req = {
        user: {},
        params: { id: 'invalid_id' }
      };
      const res = {
        status: function (code) {
          assert.equal(code, 400);
          return this;
        },
        send: function (response) {
          assert.equal(response.message, 'No se encontro el usuario');
        }
      };
      sinon.stub(Cliente, 'findById').returns(null);

      await controller.obtener_cliente_id(req, res);
    });
    it('Debe retornar un mensaje de error al no estar el usuario identificado', function (done) {
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

      controller.obtener_cliente_id(req, res);
    });
  });
  describe('#actualizar_cliente_vip', function () {
    beforeEach(function () {
      sinon.restore();
    });

    it('debería actualizar el cliente a VIP y hacer un registro de movimiento si el saldo de la cuenta es mayor a 150', async function () {
      const clienteId = '60918ec465c98f001db838f1';
      const cuentaId = '60918ec465c98f001db838f2';
      const req = {
        params: { clienteId, cuentaId },
        user: { _id: '60918ec465c98f001db838f3' }
      };
      const cuenta = { saldo: 200 };
      const res = {
        status: function (code) {
          assert.equal(code, 200);
          return this;
        },
        send: function (response) {
          assert.equal(response.message, 'Bienvenido a los vips');
        }
      };
      sinon.stub(Cuenta, 'findOne').returns(cuenta);
      sinon.stub(Cuenta, 'findByIdAndUpdate').returns();
      sinon.stub(Movimiento, 'create').returns();
      sinon.stub(Cliente, 'findByIdAndUpdate').returns();

      await controller.actualizar_cliente_vip(req, res);

      sinon.assert.calledWith(Cuenta.findOne, { _id: cuentaId });
      sinon.assert.calledWith(Cuenta.findByIdAndUpdate, { _id: cuentaId }, { saldo: 50 });
      sinon.assert.calledWith(Movimiento.create, {
        cuenta: cuentaId,
        tipo: "R",
        monto: 150,
        descripcion: "Ser VIP",
        isIngreso: false
      });
      sinon.assert.calledWith(Cliente.findByIdAndUpdate, { _id: clienteId }, { tipo: "vip" });
    });
    it('debería retornar un mensaje de error si el saldo de la cuenta es menor o igual a 150', async function () {
      const clienteId = '60918ec465c98f001db838f1';
      const cuentaId = '60918ec465c98f001db838f2';
      const req = {
        params: { clienteId, cuentaId },
        user: { _id: '60918ec465c98f001db838f3' }
      };
      const cuenta = { saldo: 100 };
      const res = {
        status: function (code) {
          assert.equal(code, 400);
          return this;
        },
        send: function (response) {
          assert.equal(response.message, 'Dinero insuficiente');
        }
      };
      sinon.stub(Cuenta, 'findOne').returns(cuenta);
      sinon.stub(fsHelper, 'add_log').returns();

      await controller.actualizar_cliente_vip(req, res);

      sinon.assert.calledWith(Cuenta.findOne, { _id: cuentaId });
      sinon.assert.calledWith(fsHelper.add_log, "ClienteController.actualizar_cliente_vip", "Dinero insuficiente");
    });
    it('debería retornar un mensaje de error si el usuario no está autenticado', async function () {
      const req = {
        params: { clienteId: '60918ec465c98f001db838f1', cuentaId: '60918ec465c98f001db838f2' },
        user: null
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
      await controller.actualizar_cliente_vip(req, res);
    });

  });
});
