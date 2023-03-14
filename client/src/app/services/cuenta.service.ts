import { Injectable } from '@angular/core';
import { Observable } from "rxjs";
import { GLOBAL } from "./GLOBAL"
import { HttpClient, HttpHeaders } from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})
export class CuentaService {

  public url: any;

  constructor(
    private _http: HttpClient,
  ) {
    this.url = GLOBAL.url;
  }

  obtener_cuenta_principal_cliente(clienteId: any, token: any): Observable<any> {
    let headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': token });
    return this._http.get(this.url + 'obtener_cuenta_principal_cliente/' + clienteId, { headers: headers });
  }

  obtener_cuentas_cliente(clienteId: any, token: any): Observable<any> {
    let headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': token });
    return this._http.get(this.url + 'obtener_cuentas_cliente/' + clienteId, { headers: headers });
  }

  obtener_movimientos_cuenta_principal(clienteId: any, token: any): Observable<any> {
    let headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': token });
    return this._http.get(this.url + 'obtener_movimientos_cuenta_principal/' + clienteId, { headers: headers });
  }

  obtener_detalle_cuenta(id: any, token: any): Observable<any> {
    let headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': token });
    return this._http.get(this.url + 'obtener_detalle_cuenta/' + id, { headers: headers });
  }

  obtener_movimientos_cuenta_id(idCuenta: any, token: any): Observable<any> {
    let headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': token });
    return this._http.get(this.url + 'obtener_movimientos_cuenta_id/' + idCuenta, { headers: headers });
  }
  obtener_movimientos_transferencias(token: any): Observable<any> {
    let headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': token });
    return this._http.get(this.url + 'obtener_movimientos_transferencias', { headers: headers });
  }
  obtener_movimientos_dep_ret(token: any): Observable<any> {
    let headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': token });
    return this._http.get(this.url + 'obtener_movimientos_dep_ret', { headers: headers });
  }
  cambiar_cuenta_principal(id: any, userId: any, token: any): Observable<any> {
    let headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': token });
    return this._http.get(this.url + 'cambiar_cuenta_principal/' + id + "/" + userId, { headers: headers });
  }
  transferir(data: any, token: any): Observable<any> {
    let headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': token });
    return this._http.post(this.url + 'transferir/', data, { headers: headers });
  }
  crear_cuenta(data: any, token: any): Observable<any> {
    let headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': token });
    return this._http.post(this.url + 'crear_cuenta/', data, { headers: headers });
  }
  crear_deposito_retiro(data: any, token: any): Observable<any> {
    let headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': token });
    return this._http.post(this.url + 'crear_deposito_retiro/', data, { headers: headers });
  }
}
