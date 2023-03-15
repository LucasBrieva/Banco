import { Component, OnInit } from '@angular/core';
import { CuentaService } from 'src/app/services/cuenta.service';
import { GLOBAL } from 'src/app/services/GLOBAL';
import { HelperService } from 'src/app/services/helper.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-crear-deposito-retiro',
  templateUrl: './crear-deposito-retiro.component.html',
  styleUrls: ['./crear-deposito-retiro.component.css']
})
export class CrearDepositoRetiroComponent implements OnInit {
  public url;
  public token;
  public id_cliente;
  public cuentas: Array<any> = [];
  public mov: any = {
    tipo: 'D',
    cuenta: ''
  };
  public msjs: any = {};
  constructor(
    private _cuentaService: CuentaService,
    private _helperService: HelperService,
    private _router: Router
  ) {
    this.url = GLOBAL.url;
    this.token = localStorage.getItem('token');
    this.id_cliente = localStorage.getItem('_id');
    this._cuentaService.obtener_cuentas_cliente(this.id_cliente, this.token).subscribe(
      res => {
        this.cuentas = res.data;
      },
      err => {
        this._helperService.iziToast(err.error.message, "ERROR", false);
      }
    );
  }
  ngOnInit(): void {
  }
  generar(generarForm: any) {
    if (generarForm.valid) {
      if (this.mov.tipo == "D") {
        this.mov.descripcion = "Deposito";
        this.mov.isIngreso = true;
      }
      else {
        this.mov.descripcion = "Retiro";
        this.mov.isIngreso = false;
      }
      this._cuentaService.crear_deposito_retiro(this.mov, this.token).subscribe(
        res=>{
          this._helperService.iziToast('SE REALIZO EL MOVIMIENTO CORRECTAMENTE', 'MOVIMIENTO REALIZADO', true);
          this._router.navigate(['/panel/depositosretiros']);
        },
        err=>{
          if (err.error.message.cuenta) {
            var msj = document.getElementById('msjCuenta') as HTMLSpanElement;
            msj.hidden = false;
            this.msjs.cuenta = err.error.message.cuenta;
          };
          if (err.error.message.tipo) {
            var msj = document.getElementById('msjTipo') as HTMLSpanElement;
            msj.hidden = false;
            this.msjs.tipo = err.error.message.tipo;
          };
          if (err.error.message.monto) {
            var msj = document.getElementById('msjMonto') as HTMLSpanElement;
            msj.hidden = false;
            this.msjs.monto = err.error.message.monto;
          }
        }
      )
    } else {
      this._helperService.iziToast('FALTAN DATOS', 'ERROR', false);
    }
  }
}
