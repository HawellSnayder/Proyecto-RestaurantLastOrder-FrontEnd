import { Routes } from '@angular/router';
import { LoginComponent } from './features/login/login';
import { LayoutComponent } from './features/layout/layout';
import { UsuariosComponent } from './features/usuarios/usuarios'; // Asegúrate de importar esto
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' }, // Si entran a localhost:4200, van a login
  { path: 'login', component: LoginComponent },
  { path: 'usuarios', component: UsuariosComponent, canActivate: [authGuard] }, // Agregamos protección
  { path: '**', redirectTo: 'login' } // Cualquier ruta desconocida va a login
];
