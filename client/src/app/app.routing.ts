import { Routes, RouterModule } from "@angular/router";
import {ModuleWithProviders} from "@angular/core";
import { InicioComponent } from "./components/inicio/inicio.component";
import { LoginComponent } from "./components/login/login.component";

import { AdminGuard } from "./guards/admin.guard"

import { IndexCuentasComponent } from "./components/cuentas/index-cuentas/index-cuentas.component";
import { DetalleCuentasComponent } from "./components/cuentas/detalle-cuentas/detalle-cuentas.component";
import { IndexTransferenciasComponent } from "./components/transferencias/index-transferencias/index-transferencias.component";

const appRoute : Routes =[
    {path: '', redirectTo: 'inicio', pathMatch:'full'},

    {path: 'inicio', component: InicioComponent, canActivate: [AdminGuard]},

    {path: 'panel', children:[
        {path:'cuentas', component:IndexCuentasComponent, canActivate:[AdminGuard]},
        {path:'cuentas/:id', component:DetalleCuentasComponent, canActivate:[AdminGuard]},
        {path:'transferencias', component:IndexTransferenciasComponent, canActivate:[AdminGuard]},

    ]},

    {path:'login', component: LoginComponent}
]

export const appRoutingProviders : any[] = [];
export const routing: ModuleWithProviders<any> = RouterModule.forRoot(appRoute);
