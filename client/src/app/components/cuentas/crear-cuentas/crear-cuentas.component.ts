import { Component, OnInit } from '@angular/core';
import { CuentaService } from 'src/app/services/cuenta.service';
import { GLOBAL } from 'src/app/services/GLOBAL';
import { HelperService } from 'src/app/services/helper.service';
import { Router } from '@angular/router';
import { ClienteService } from 'src/app/services/cliente.service';

@Component({
  selector: 'app-crear-cuentas',
  templateUrl: './crear-cuentas.component.html',
  styleUrls: ['./crear-cuentas.component.css']
})
export class CrearCuentasComponent implements OnInit {
  public cuenta: any = {
    tipo: '',
    principal: 'true'
  };
  public url;
  public token;
  public id_cliente;
  public cliente: any = {};
  constructor(
    private _cuentaService: CuentaService,
    private _clienteService: ClienteService,
    private _helperService: HelperService,
    private _router: Router
  ) {
    this.url = GLOBAL.url;
    this.token = localStorage.getItem('token');
    this.id_cliente = localStorage.getItem('_id');
    this._clienteService.obtener_cliente_id(this.id_cliente, this.token).subscribe(
      res=>{
        this.cliente = res.data;
      },
      err=>{
        this._helperService.iziToast(err.error.message, "ERROR", false);
      }
    )
  }

  ngOnInit(): void {
  }
  registro(registroForm: any) {
    if (registroForm.valid) {
      this.cuenta.cliente = this.id_cliente;
      this.cuenta.cbu = this.cbuRandom();
      this.cuenta.alias = this.aliasRandom();
      this.cuenta.descubierto = 0;
      this.cuenta.nroCuenta = this.nroCuentaRandom();
      this._cuentaService.crear_cuenta(this.cuenta, this.token).subscribe(
        res => {
          this._helperService.iziToast('SE CREO LA CUENTA CORRECTAMENTE', 'CREADA', true);
          this._router.navigate(['/panel/cuentas']);
        },
        err => {
          this._helperService.iziToast(err.error.message, "ERROR", false);
        }
      )
    }
    else {
      this._helperService.iziToast('FALTAN DATOS', 'ERROR', false);
    }
  }
  private cbuRandom() {
    let randomString = '';
    const length = 22;

    for (let i = 0; i < length; i++) {
      const randomNum = Math.floor(Math.random() * 10);
      randomString += randomNum.toString();
    }
    return randomString;
  }
  private aliasRandom() {
    const words = ['perro', 'gato', 'pájaro', 'elefante', 'jirafa', 'serpiente', 'ardilla', 'tortuga', 'rana', 'conejo'];
    let randomString = '';

    for (let i = 0; i < 3; i++) {
      const randomIndex = Math.floor(Math.random() * words.length);
      const randomWord = words[randomIndex];
      randomString += randomWord;

      if (i !== 2) {
        randomString += '.';
      }
    }

    return randomString;
  }
  private nroCuentaRandom() {
    const characters = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let randomString = '';

    for (let i = 0; i < 10; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      const randomChar = characters[randomIndex];
      randomString += randomChar;
    }

    return randomString;
  }
}
