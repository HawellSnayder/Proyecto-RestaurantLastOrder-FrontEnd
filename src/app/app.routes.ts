import { Routes } from '@angular/router';
import { LoginComponent } from './features/login/login';
import { LayoutComponent } from './features/layout/layout';
import { UsuariosComponent } from './features/usuarios/usuarios';
import { CategoriasComponent } from './features/categorias/categorias';
import { PlatosComponent } from './features/platos/platos';
import { MesasComponent } from './features/mesas/mesas';
import { CrearPedidoComponent } from './features/pedidos/crear-pedido/crear-pedido';
import { PedidosPendientesComponent } from './features/pedidos/pedidos-pendientes/pedidos-pendientes';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },

  {
    path: '',
    component: LayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: 'usuarios', component: UsuariosComponent },
      { path: 'categorias', component: CategoriasComponent },
      { path: 'platos', component: PlatosComponent },
      { path: 'mesas', component: MesasComponent },
      {
        path: 'pedidos',
        children: [
          { path: 'nuevo', component: CrearPedidoComponent },
          { path: 'pendientes', component: PedidosPendientesComponent }
        ]
      },

      { path: 'dashboard', redirectTo: 'usuarios', pathMatch: 'full' }
    ]
  },

  { path: '**', redirectTo: 'login' }
];
