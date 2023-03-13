import { Component, OnInit } from '@angular/core';
import { ClienteService } from 'src/app/services/cliente.service';
import { CuentaService } from 'src/app/services/cuenta.service';
import { GLOBAL } from 'src/app/services/GLOBAL';
import { HelperService } from 'src/app/services/helper.service';

declare var $: any;

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {

  public cliente: any = {};
  public token;
  public url;
  public cuentas: Array<any> = [];
  public cuentaId = '';
  constructor(
    private _clienteService: ClienteService,
    private _cuentaService: CuentaService,
    private _helperService: HelperService
  ) {
    this.url = GLOBAL.url;
    this.cliente._id = localStorage.getItem('_id');
    this.token = localStorage.getItem('token');
    this._clienteService.obtener_cliente_id(this.cliente._id, this.token).subscribe(
      res => {
        this.cliente = res.data;
      },
      err => {
      }
    )
  }

  ngOnInit(): void {
  }
  hazteVip() {
    this._cuentaService.obtener_cuentas_cliente(this.cliente._id, this.token).subscribe(
      res => {
        this.cuentas = res.data;
      },
      err => {
        console.log(err);
      }
    );
    $('#modalVip').modal('show');
    $('.modal-backdrop').addClass('show');
  }
  actualizar_tipo_cliente() {
    if (this.cuentaId != '') {
      this._clienteService.actualizar_cliente_vip(this.cliente._id, this.cuentaId, this.token).subscribe(
        res => {
          this._helperService.iziToast('BIENVENIDO AL CLUB DE LOS VIPS', "BIENVENIDO", true);
          this.cliente.tipo = 'vip';
          $('#modalVip').modal('hide');
          $('.modal-backdrop').addClass('hide');
        },
        err => {
          this._helperService.iziToast('No cuenta con fondos suficientes, deposite o cambie de cuenta', "ERROR", false);
        }
      )
    }
    else {
      this._helperService.iziToast('Favor de seleccionar una cuenta', "ERROR", false);
    }
  }
}
