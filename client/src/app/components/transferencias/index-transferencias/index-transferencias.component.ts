import { Component, OnInit } from '@angular/core';
import { CuentaService } from 'src/app/services/cuenta.service';
import { GLOBAL } from 'src/app/services/GLOBAL';

@Component({
  selector: 'app-index-transferencias',
  templateUrl: './index-transferencias.component.html',
  styleUrls: ['./index-transferencias.component.css']
})
export class IndexTransferenciasComponent implements OnInit {

  public url;
  public token;
  public id_cliente;
  public movimientos: Array<any> = [];

  constructor(
    private _cuentaService: CuentaService
  ) {
    this.url = GLOBAL.url;
    this.token = localStorage.getItem('token');
    this.id_cliente = localStorage.getItem('_id');
    this._cuentaService.obtener_movimientos_transferencias(this.token).subscribe(
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
  
}
