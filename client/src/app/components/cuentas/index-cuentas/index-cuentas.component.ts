import { Component, OnInit } from '@angular/core';
import { CuentaService } from 'src/app/services/cuenta.service';
import { GLOBAL } from 'src/app/services/GLOBAL';

@Component({
  selector: 'app-index-cuentas',
  templateUrl: './index-cuentas.component.html',
  styleUrls: ['./index-cuentas.component.css']
})
export class IndexCuentasComponent implements OnInit {
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
    this._cuentaService.obtener_cuentas_cliente(this.id_cliente, this.token).subscribe(
      res => {
        this.cuentas = res.data;
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
