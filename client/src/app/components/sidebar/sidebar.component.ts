import { Component, OnInit } from '@angular/core';
import { ClienteService } from 'src/app/services/cliente.service';
import { GLOBAL } from 'src/app/services/GLOBAL';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {

  public cliente:any = {};
  public token;
  public url;

  constructor(
    private _clienteService: ClienteService
  ) { 
    this.url = GLOBAL.url;
    this.cliente._id = localStorage.getItem('_id');
    this.token = localStorage.getItem('token');
    this._clienteService.obtener_cliente_id(this.cliente._id, this.token).subscribe(
      res=>{
        this.cliente = res.data;
      },
      err=>{

      }
    )
  }

  ngOnInit(): void {
  }

}
