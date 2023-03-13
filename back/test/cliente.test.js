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
  describe('#login_cliente', function() {
    it('Debe iniciar sesión correctamente si el correo electrónico y la contraseña son válidos', function(done) {
      const req = {
        body: {
          email: 'test@test.com',
          password: '1234'
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
      sinon.restore(); 
      sinon.stub(Cliente, 'find').returns([user]);
      sinon.stub(bcrypt, 'compare').yields(null, true);
    
      controller.login_cliente(req, res);
    });

    it('Debería devolver un error cuando no se proporcione el correo electrónico', async function() {
      const req = {
        body: {
          password: '1234'
        }
      };
      const res = {
        status: function(code) {
          assert.equal(code, 400);
          return this;
        },
        send: function(response) {
          assert.equal(response.message, 'No se proporcionó el correo electrónico');
          assert.equal(response.data, undefined);
          done();
        }
      };
    
      await controller.login_cliente(req, res);
    });
    it('Debería devolver un error cuando no se proporcione la contraseña', async function() {
      const req = {
        body: {
          email: 'test@test.com'
        }
      };
      const res = {
        status: function(code) {
          assert.equal(code, 400);
          return this;
        },
        send: function(response) {
          assert.equal(response.message, 'No se proporcionó la contraseña');
          assert.equal(response.data, undefined);
          done();
        }
      };
    
      await controller.login_cliente(req, res);
    });
    it('Debería devolver un error cuando el correo electrónico no existe', function(done) {
      const req = {
        body: {
          email: 'nonexistent@test.com',
          password: '1234'
        }
      };
      const res = {
        status: function(code) {
          assert.equal(code, 400);
          return this;
        },
        send: function(response) {
          assert.equal(response.message, 'No se encontró el correo');
          assert.equal(response.data, undefined);
          done();
        }
      };
      sinon.restore(); 
      sinon.stub(Cliente, 'find').returns([]);
    
      controller.login_cliente(req, res);
    });
    it('Debería devolver un error cuando la contraseña no coincide', async function() {
      const req = {
        body: {
          email: 'test@test.com',
          password: 'wrongpassword'
        }
      };
      const res = {
        status: function(code) {
          assert.equal(code, 400);
          return this;
        },
        send: function(response) {
          assert.equal(response.message, 'La contraseña no coincide');
          assert.equal(response.data, undefined);
          done();
        }
      };
      sinon.restore(); 
      sinon.stub(Cliente, 'find').returns([{
        email: 'test@test.com',
        password: 'hashedpassword',
        dadoBaja: false
      }]);
      sinon.stub(bcrypt, 'compare').yields(null, false);
    
      await controller.login_cliente(req, res);
    });
    it('Debería devolver un error si el usuario está dado de baja', async function() {
      const req = {
        body: {
          email: 'client1@test.com',
          password: '1234'
        }
      };
      const res = {
        status: function(code) {
          assert.equal(code, 400);
          return this;
        },
        send: function(response) {
          assert.equal(response.message, 'El usuario está dado de baja');
          assert.equal(response.data, undefined);
          done();
        }
      };
      sinon.restore();
      sinon.stub(Cliente, 'find').returns([{ email: req.body.email, password: 'hash', dadoBaja: true }]);

      await controller.login_cliente(req, res);
    });
  });
});
