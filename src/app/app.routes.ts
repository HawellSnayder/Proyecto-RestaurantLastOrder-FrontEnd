import { Routes } from '@angular/router';
import { LoginComponent } from './features/login/login';
import { LayoutComponent } from './features/layout/layout';
import { UsuariosComponent } from './features/usuarios/usuarios';
import { CategoriasComponent } from './features/categorias/categorias';
import { PlatosComponent } from './features/platos/platos';
import { MesasComponent } from './features/mesas/mesas';
// 1. IMPORTAR LOS NUEVOS COMPONENTES DE PEDIDOS
import { CrearPedidoComponent } from './features/pedidos/crear-pedido/crear-pedido';
import { PedidosPendientesComponent } from './features/pedidos/pedidos-pendientes/pedidos-pendientes';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },

  // RUTAS PROTEGIDAS (Envueltas en el Layout)
  {
    path: '',
    component: LayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: 'usuarios', component: UsuariosComponent },
      { path: 'categorias', component: CategoriasComponent },
      { path: 'platos', component: PlatosComponent },
      { path: 'mesas', component: MesasComponent },

      // 2. CONFIGURAR LAS RUTAS DE PEDIDOS SEGÚN TU MENÚ LATERAL
      {
        path: 'pedidos',
        children: [
          { path: 'nuevo', component: CrearPedidoComponent },      // /pedidos/nuevo
          { path: 'pendientes', component: PedidosPendientesComponent } // /pedidos/pendientes
        ]
      },

      { path: 'dashboard', redirectTo: 'usuarios', pathMatch: 'full' }
    ]
  },

  { path: '**', redirectTo: 'login' }
];
