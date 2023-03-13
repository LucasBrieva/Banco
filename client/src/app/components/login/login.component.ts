import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AdminService } from 'src/app/services/admin.service';
import { ClienteService } from 'src/app/services/cliente.service';
import { HelperService } from 'src/app/services/helper.service';

declare var jquery:any;
declare var $:any;
declare var iziToast: any;
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  public user : any = {};
  public usuario:any = {};
  public token:any = '';

  constructor(
    private _adminService:AdminService,
    private _clienteService:ClienteService,
    private _router: Router,
    private _helperService:HelperService
  ) {
    this.token= this._adminService.getToken();
   }

  ngOnInit(): void {
    if(this.token){
      this._router.navigate(['']);
    }
    else{
      
    }
  }

  login(loginForm: any){
    if(loginForm.valid){

      let data={
        email: this.user.email,
        password: this.user.password
      }
      this._clienteService.login_cliente(data).subscribe(
        response => {
          if(response.data == undefined){
            this._helperService.iziToast(response.message, "ERROR", false);
          }else{
            this._helperService.iziToast('Hola ' + response.data.nombres.toUpperCase() + ', bienvenido/a', "BIENVENIDO", true);
            this.usuario= response.data;
            localStorage.setItem('token', response.token);
            localStorage.setItem('_id',response.data._id)
            setTimeout(() => {
              this._router.navigate(['/']);
            }, 2000);
          }
          
        },
        error => {
          console.log(error);
        }
      )
    }else{
      this._helperService.iziToast('Los datos del formulario no son válidos', "ERROR", false);
      
    }
  }
  togglePassword(id:string){
    this._helperService.togglePassword(id);
  }
}
