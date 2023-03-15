import { Component, OnInit } from '@angular/core';
import { CuentaService } from 'src/app/services/cuenta.service';
import { GLOBAL } from 'src/app/services/GLOBAL';
import { HelperService } from 'src/app/services/helper.service';

@Component({
  selector: 'app-inicio',
  templateUrl: './inicio.component.html',
  styleUrls: ['./inicio.component.css']
})
export class InicioComponent implements OnInit {

  public url;
  public token;
  public id_cliente;
  public cuentas: Array<any> = [];
  public movimientos: Array<any> = [];
  constructor(
    private _cuentaService: CuentaService,
    private _helperService: HelperService
  ) {
    this.url = GLOBAL.url;
    this.token = localStorage.getItem('token');
    this.id_cliente = localStorage.getItem('_id');
    this._cuentaService.obtener_cuenta_principal_cliente(this.id_cliente, this.token).subscribe(
      res => {
        this.cuentas = res.data;
      },
      err => {
        this._helperService.iziToast(err.error.message, "ERROR", false);
        this.cuentas = [];
      }
    );
    this._cuentaService.obtener_movimientos_cuenta_principal(this.id_cliente, this.token).subscribe(
      res => {
        this.movimientos = res.data;
      },
      err => {
        this._helperService.iziToast(err.error.message, "ERROR", false);
      }
    );
  }

  ngOnInit(): void {
  }
  test() {
  }
}
