import { Routes } from '@angular/router';
import { LoginComponent } from './features/login/login';
import { LayoutComponent } from './features/layout/layout';
import { UsuariosComponent } from './features/usuarios/usuarios'; // Asegúrate de importar esto
import { authGuard } from './core/guards/auth.guard';
import { CategoriasComponent } from './features/categorias/categorias';

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

      // 1. AGREGA ESTA LÍNEA (y crea el componente si no lo tienes)
      { path: 'pedidos', component: CategoriasComponent },

      // Ejemplo de otra ruta para meseros
      // { path: 'mesas', component: MesasComponent },
    ]
  },

  { path: '**', redirectTo: 'login' }
];
