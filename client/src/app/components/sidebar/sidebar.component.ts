import { Component, OnInit } from '@angular/core';
import { ClienteService } from 'src/app/services/cliente.service';
import { CuentaService } from 'src/app/services/cuenta.service';
import { GLOBAL } from 'src/app/services/GLOBAL';
import { HelperService } from 'src/app/services/helper.service';
import { Router } from '@angular/router';

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
    private _helperService: HelperService,
    private _router: Router
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
    );
    this.obtener_cuentas_cliente();
  }

  ngOnInit(): void {
  }
  hazteVip() {
    this.obtener_cuentas_cliente();
    if(this.cuentas.length > 0){
      $('#modalVip').modal('show');
      $('.modal-backdrop').addClass('show');
    }
    else{
      this._helperService.iziToast('Favor de crear una cuenta primero', "ERROR", false);
    }
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
  logOut(){
    localStorage.clear();
    this.cliente = undefined;
    this._router.navigate(['/login']);
  }
  obtener_cuentas_cliente(){
    this._cuentaService.obtener_cuentas_cliente(this.cliente._id, this.token).subscribe(
      res => {
        this.cuentas = res.data;
      },
      err => {
        this._helperService.iziToast(err.error.message, "ERROR", false);
      }
    );
  }
}
