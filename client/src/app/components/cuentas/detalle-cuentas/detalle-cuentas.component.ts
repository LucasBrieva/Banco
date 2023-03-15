import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CuentaService } from 'src/app/services/cuenta.service';
import { GLOBAL } from 'src/app/services/GLOBAL';
import { HelperService } from 'src/app/services/helper.service';

@Component({
  selector: 'app-detalle-cuentas',
  templateUrl: './detalle-cuentas.component.html',
  styleUrls: ['./detalle-cuentas.component.css']
})
export class DetalleCuentasComponent implements OnInit {

  public token;
  public id : any;
  public cuenta : any = {};
  public movimientos: Array<any> = [];

  constructor(
    private _route : ActivatedRoute,
    private _cuentaService : CuentaService,
    private _helperService: HelperService
  ) {
    this.token = localStorage.getItem('token');
    this._route.params.subscribe(
      params=>{
        this.id = params['id'];
        this._cuentaService.obtener_detalle_cuenta(this.id, this.token).subscribe(
          res=>{
            this.cuenta = res.data;
            this._cuentaService.obtener_movimientos_cuenta_id(this.id, this.token).subscribe(
              res=>{
                this.movimientos = res.data;
              },
              err=>{
                this._helperService.iziToast(err.error.message, "ERROR", false);
              }
            )
          },
          err=>{

          }
        )
      }
    )
  }

  ngOnInit(): void {
  }
  test() {
  }

}
