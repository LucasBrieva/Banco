import { Injectable } from '@angular/core';
import { Observable } from "rxjs";
import { GLOBAL } from "./GLOBAL"
import { HttpClient, HttpHeaders} from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})
export class ClienteService {

  public url:any;

  constructor(
    private _http: HttpClient,
  ) {
  this.url = GLOBAL.url;
  }

  //#region GET

  obtener_cliente_id(id:any, token:any):Observable<any>{
    let headers = new HttpHeaders({'Content-Type':'application/json','Authorization': token});
    return this._http.get(this.url+'obtener_cliente_id/' + id, {headers:headers});
  }
  actualizar_cliente_vip(clienteId:any, cuentaId:any, token:any):Observable<any>{
    let headers = new HttpHeaders({'Content-Type':'application/json','Authorization': token});
    return this._http.put(this.url+'actualizar_cliente_vip/' + clienteId + "/" + cuentaId, { data: true }, {headers:headers});
  }

  //#endregion
  
  //#region POST

  listar_clientes_filtro_admin(filtro:any, token:any):Observable<any>{
    let headers = new HttpHeaders({'Content-Type':'application/json','Authorization': token});
    return this._http.post(this.url+'listar_clientes_filtro_admin/', filtro, {headers:headers});
  }

  registro_cliente(data:any):Observable<any>{
    let headers = new HttpHeaders({'Content-Type':'application/json'});
    return this._http.post(this.url+'registro_cliente/', data, {headers:headers});
  }

  login_cliente(data:any): Observable<any> {
    let headers = new HttpHeaders().set('Content-Type', 'application/json');
    return this._http.post(this.url + 'login_cliente/', data, { headers: headers });
  }

  //#endregion
  
  //#region PUT

  actualizar_cliente_admin(id:any, data:any, token:any):Observable<any>{
    let headers = new HttpHeaders({'Content-Type':'application/json','Authorization': token});
    return this._http.put(this.url+'actualizar_cliente_admin/'+ id, data, {headers:headers});
  }

  baja_cliente_admin(id:any, token:any):Observable<any>{
    let headers = new HttpHeaders({'Content-Type':'application/json','Authorization': token});
    return this._http.put(this.url+'baja_cliente_admin/'+ id, null,{headers:headers});
  }

  //#endregion

}
