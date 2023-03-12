import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { NgbPaginationModule} from "@ng-bootstrap/ng-bootstrap"
import { NgxTinymceModule } from 'ngx-tinymce';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { routing } from "./app.routing";
import { InicioComponent } from './components/inicio/inicio.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { LoginComponent } from './components/login/login.component';
import { IndexCuentasComponent } from './components/cuentas/index-cuentas/index-cuentas.component';
import { DetalleCuentasComponent } from './components/cuentas/detalle-cuentas/detalle-cuentas.component';
import { IndexTransferenciasComponent } from './components/transferencias/index-transferencias/index-transferencias.component';
import { CrearTransferenciaComponent } from './components/transferencias/crear-transferencia/crear-transferencia.component';

@NgModule({
  declarations: [
    AppComponent,
    InicioComponent,
    LoginComponent,
    SidebarComponent,
    IndexCuentasComponent,
    DetalleCuentasComponent,
    IndexTransferenciasComponent,
    CrearTransferenciaComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule,
    routing,
    NgbPaginationModule,
    NgxTinymceModule.forRoot({
      baseURL: '../../../assets/tinymce/',
    })

  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
