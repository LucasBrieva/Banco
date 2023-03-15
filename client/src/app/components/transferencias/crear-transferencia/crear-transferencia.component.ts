import { Component, OnInit } from '@angular/core';
import { CuentaService } from 'src/app/services/cuenta.service';
import { Router } from '@angular/router';
import { GLOBAL } from 'src/app/services/GLOBAL';
import { HelperService } from 'src/app/services/helper.service';

@Component({
  selector: 'app-crear-transferencia',
  templateUrl: './crear-transferencia.component.html',
  styleUrls: ['./crear-transferencia.component.css']
})
export class CrearTransferenciaComponent implements OnInit {
  public url;
  public token;
  public id_cliente;
  public cuentas: Array<any> = [];
  public transferencia: any = {
    tipo: 'T',
    cuenta: '',
    cbuDestino: ''
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
  transferir(transferirForm: any) {
    if (transferirForm.valid) {
      this._cuentaService.transferir(this.transferencia, this.token).subscribe(
        res => {
          this._helperService.iziToast('SE REALIZO LA TRANSFERENCIA CORRECTAMENTE', 'TRANSFERIDO', true);
          this._router.navigate(['/panel/transferencias']);
        },
        err => {
          if (err.error.message.cbuDestino) {
            var msjCbu = document.getElementById('msjCbu') as HTMLSpanElement;
            msjCbu.hidden = false;
            this.msjs.cbuDestino = err.error.message.cbuDestino;
          };
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
    }
    else {
      this._helperService.iziToast('Falta que ingrese algún dato, verifique por favor.', 'ERROR', true);
    }
  }
  limpiarCuenta() {
    this.transferencia.cbuDestino = '';
  }
}
