import { Routes } from '@angular/router';
import { LoginComponent } from './features/login/login';
import { LayoutComponent } from './features/layout/layout';
import { UsuariosComponent } from './features/usuarios/usuarios';
import { CategoriasComponent } from './features/categorias/categorias';
import { PlatosComponent } from './features/platos/platos';
import { MesasComponent } from './features/mesas/mesas'; // <--- 1. IMPORTAR MESAS
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

      // 2. RUTA PARA LA GESTIÓN DE MESAS
      { path: 'mesas', component: MesasComponent },

      // RUTA PARA PEDIDOS
      { path: 'pedidos', component: CategoriasComponent },

      { path: 'dashboard', redirectTo: 'usuarios', pathMatch: 'full' }
    ]
  },

  { path: '**', redirectTo: 'login' }
];
