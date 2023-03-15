import { Component, OnInit } from '@angular/core';
import { CuentaService } from 'src/app/services/cuenta.service';
import { GLOBAL } from 'src/app/services/GLOBAL';
import { HelperService } from 'src/app/services/helper.service';

@Component({
  selector: 'app-deposito-retiro-index',
  templateUrl: './deposito-retiro-index.component.html',
  styleUrls: ['./deposito-retiro-index.component.css']
})
export class DepositoRetiroIndexComponent implements OnInit {

  public url;
  public token;
  public id_cliente;
  public movimientos: Array<any> = [];
  public cuentas: Array<any> = [];

  constructor(
    private _cuentaService: CuentaService,
    private _helperService: HelperService
  ) {
    this.url = GLOBAL.url;
    this.token = localStorage.getItem('token');
    this.id_cliente = localStorage.getItem('_id');
    this._cuentaService.obtener_movimientos_dep_ret(this.token).subscribe(
      res => {
        this.movimientos = res.data;
      },
      err => {
        this._helperService.iziToast(err.error.message, "ERROR", false);
      }
    );
    this._cuentaService.obtener_cuentas_cliente(this.id_cliente,this.token).subscribe(
      res => {
        this.cuentas = res.data;
      },
      err => {
        this.cuentas = [];
      }
    );
  }

  ngOnInit(): void {
  }
}
