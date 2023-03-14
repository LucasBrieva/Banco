import { Component, OnInit } from '@angular/core';
import { CuentaService } from 'src/app/services/cuenta.service';
import { GLOBAL } from 'src/app/services/GLOBAL';
import { HelperService } from 'src/app/services/helper.service';

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
    private _cuentaService: CuentaService,
    private _helperService: HelperService
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
  establecer_principal(id: any) {
    this._cuentaService.cambiar_cuenta_principal(id, localStorage.getItem('_id'), this.token).subscribe(
      res => {
        this.obtener_cuentas();
        this._helperService.iziToast(res.message.toUpperCase(), "ACTUALIZADO", true);

      },
      err => {

      }
    )
  }
  obtener_cuentas(){
    this._cuentaService.obtener_cuentas_cliente(this.id_cliente, this.token).subscribe(
      res => {
        this.cuentas = res.data;
      },
      err => {
        console.log(err);
      }
    );
  }
}
