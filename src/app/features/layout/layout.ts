import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './layout.html',
  styleUrls: ['./layout.css']
})
export class LayoutComponent implements OnInit {
  rol: string = '';
  username: string = '';
  menuItems: any[] = [];

  constructor(private router: Router) {}

  ngOnInit() {
    // Recuperamos los datos que guardamos en el login
    this.rol = localStorage.getItem('rol') || '';
    this.username = localStorage.getItem('username') || 'Usuario';
    this.definirMenu();
  }

  definirMenu() {
    const opciones = [
      { label: 'Usuarios', path: '/usuarios', roles: ['ADMIN'] },
      { label: 'Categorías', path: '/categorias', roles: ['ADMIN'] },
      { label: 'Platos/Menú', path: '/platos', roles: ['ADMIN'] },
      { label: 'Mesas', path: '/mesas', roles: ['ADMIN', 'MESERO'] },
      { label: 'Pedidos', path: '/pedidos', roles: ['ADMIN', 'MESERO', 'CAJERO'] },
      { label: 'Cocina', path: '/cocina', roles: ['ADMIN', 'COCINA'] }
    ];

    // Filtramos las opciones según el rol del usuario logueado
    this.menuItems = opciones.filter(opt => opt.roles.includes(this.rol));
  }

  logout() {
    localStorage.clear();
    this.router.navigate(['/login']);
  }
}
