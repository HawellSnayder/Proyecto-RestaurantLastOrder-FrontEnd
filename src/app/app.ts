import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router } from '@angular/router';
import { LayoutComponent } from './features/layout/layout';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, LayoutComponent],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class App {
  constructor(private router: Router) {} // Inyecta el Router

  isLoggedIn(): boolean {
    // 1. Si estamos en la ruta de login, NUNCA mostrar el layout
    if (this.router.url === '/login' || this.router.url === '/') {
      return false;
    }
    // 2. Si no estamos en login, mostrarlo solo si hay token
    return !!localStorage.getItem('token');
  }
}
