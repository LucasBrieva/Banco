const assert = require('assert');
const sinon = require('sinon');
const bcrypt = require('bcrypt-nodejs');

const Cliente = require('../models/cliente');
const Direccion = require('../models/direccion');
const controller = require('../controllers/clienteController');

describe('ClienteController', function() {
  describe('#registro_cliente', function() {
    it('Debe crear un nuevo cliente si el correo electrónico no existe y se proporciona la contraseña', async function() {
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
        status: function(code) {
          assert.equal(code, 200);
          return this;
        },
        send: function(response) {
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

    it('Debería devolver un error si el correo electrónico ya existe', function(done) {
      const req = {
        body: {
          email: 'test@gmail.com',
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
        status: function(code) {
          assert.equal(code, 400);
          return this;
        },
        send: function(response) {
          assert.equal(response.message, 'El correo ya existe en la base de datos');
          assert.equal(response.data, undefined);
          done();
        }
      };
      sinon.restore(); 
      sinon.stub(Cliente, 'find').returns([{ email: req.body.email }]);

      controller.registro_cliente(req, res);
    });

    it('Debería devolver un error si la contraseña no se envía', function(done) {
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
        status: function(code) {
          assert.equal(code, 400);
          return this;
        },
        send: function(response) {
          assert.equal(response.message, 'No hay una contraseña');
          assert.equal(response.data, undefined);
          done();
        }
      };
      sinon.restore(); 
      sinon.stub(Cliente, 'find').returns([]);

      controller.registro_cliente(req, res);
    });
    it('Debería devolver un error si el correo no es válido', async function(done) {
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
        status: function(code) {
          assert.equal(code, 400);
          return this;
        },
        send: function(response) {
          assert.equal(response.message, 'Debe ingresar un correo valido');
          assert.equal(response.data, undefined);
          done();
        }
      };
      sinon.restore(); 
      sinon.stub(Cliente, 'find').returns([]);

      await controller.registro_cliente(req, res);
    });
    it('Debería devolver un error si no se envía data', async function(done) {
      const req = {
      };
      const res = {
        status: function(code) {
          assert.equal(code, 400);
          return this;
        },
        send: function(response) {
          assert.equal(response.message, 'Datos invalidos');
          assert.equal(response.data, undefined);
          done();
        }
      };
      sinon.restore(); 
      sinon.stub(Cliente, 'find').returns([]);

      await controller.registro_cliente(req, res);
    });
  });
});
