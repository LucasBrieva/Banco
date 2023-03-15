import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AdminService } from 'src/app/services/admin.service';
import { ClienteService } from 'src/app/services/cliente.service';
import { HelperService } from 'src/app/services/helper.service';

declare var jquery: any;
declare var $: any;
declare var iziToast: any;
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  public user: any = {};
  public usuario: any = {};
  public token: any = '';
  public crearCuenta = false;

  public imagenes = [
    'assets/img/components/login/fondo1.jpeg',
    'assets/img/components/login/fondo2.jpeg',
    'assets/img/components/login/fondo3.jpeg',
    'assets/img/components/login/fondo4.jpeg',
    'assets/img/components/login/fondo5.jpeg',
    'assets/img/components/login/fondo6.jpeg',
    'assets/img/components/login/fondo7.jpeg',
    'assets/img/components/login/fondo8.jpeg',
  ];
  public imagenActual = 1;

  constructor(
    private _adminService: AdminService,
    private _clienteService: ClienteService,
    private _router: Router,
    private _helperService: HelperService
  ) {
    this.token = this._adminService.getToken();
  }

  ngOnInit(): void {
    if (this.token) {
      this._router.navigate(['']);
    }
    else {

    };
    setInterval(() => {
      this.imagenActual = (this.imagenActual + 1) % this.imagenes.length;
      const imgFondo: any = document.getElementById('imgFondo');
      imgFondo.setAttribute('src', this.imagenes[this.imagenActual]);
    }, 5000); // Cambiar imagen cada 5 segundos
  }

  login(loginForm: any) {
    if (loginForm.valid) {

      let data = {
        email: this.user.email,
        password: this.user.password
      }
      this._clienteService.login_cliente(data).subscribe(
        response => {
          if (response.data == undefined) {
            this._helperService.iziToast(response.message, "ERROR", false);
          } else {
            this._helperService.iziToast('Hola ' + response.data.nombres.toUpperCase() + ', bienvenido/a', "BIENVENIDO", true);
            this.usuario = response.data;
            localStorage.setItem('token', response.token);
            localStorage.setItem('_id', response.data._id)
            setTimeout(() => {
              this._router.navigate(['/']);
            }, 2000);
          }

        },
        error => {
          this._helperService.iziToast('No se encontro al usuario en la base de datos', "ERROR", false);
        }
      )
    } else {
      this._helperService.iziToast('Los datos del formulario no son válidos', "ERROR", false);

    }
  }
  togglePassword(id: string) {
    this._helperService.togglePassword(id);
  }
  cambiarCrearCuenta() {
    this.crearCuenta = !this.crearCuenta;
  }
  registrar(registrarForm: any) {
    if (registrarForm.valid) {
      this.user.pais = "Argentina";
      this.user.f_nacimiento = "11/11/1999";
      this.user.tipo = "normal";
      this._clienteService.registro_cliente(this.user).subscribe(
        res => {
          this._helperService.iziToast('Hola ' + res.data.nombres.toUpperCase() + ', bienvenido/a', "BIENVENIDO", true);
          this.usuario = res.data;
          localStorage.setItem('token', res.token);
          localStorage.setItem('_id', res.data._id)
          setTimeout(() => {
            this._router.navigate(['/']);
          }, 2000);
        },
        err => {
          this._helperService.iziToast(err.error.message, "ERROR", false);
        }
      )
    } else {
      this._helperService.iziToast('Ingreso algún dato mal', "ERROR", false);
    }

  }
}
