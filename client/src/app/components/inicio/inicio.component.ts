import { Component, OnInit } from '@angular/core';
import { CuentaService } from 'src/app/services/cuenta.service';
import { GLOBAL } from 'src/app/services/GLOBAL';

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
    private _cuentaService: CuentaService
  ) {
    this.url = GLOBAL.url;
    this.token = localStorage.getItem('token');
    this.id_cliente = localStorage.getItem('_id');
    this._cuentaService.obtener_cuenta_principal_cliente(this.id_cliente, this.token).subscribe(
      res => {
        this.cuentas = res.data;
      },
      err => {
        console.log(err);
      }
    );
    this._cuentaService.obtener_movimientos_cuenta_principal(this.id_cliente, this.token).subscribe(
      res => {
        this.movimientos = res.data;
      },
      err => {
        console.log(err);
      }
    );
  }

  ngOnInit(): void {
  }
  test() {
  }
}
