import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
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

  constructor(
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.rol = localStorage.getItem('rol') || '';
      this.username = localStorage.getItem('username') || 'Usuario';
      this.definirMenu();
    }
  }

  definirMenu() {
    const opciones = [
      { label: '👥 Usuarios', path: '/usuarios', roles: ['ADMIN'] },
            { label: '📂 Categorías', path: '/categorias', roles: ['ADMIN'] },
            { label: '🍴 Platos/Menú', path: '/platos', roles: ['ADMIN'] },
            { label: '🪑 Mesas', path: '/mesas', roles: ['ADMIN', 'MESERO'] },
      { label: '✍️ Crear Pedido', path: '/pedidos/nuevo', roles: ['ADMIN', 'MESERO'] },
      { label: '⏳ Pedidos Pendientes', path: '/pedidos/pendientes', roles: ['ADMIN', 'MESERO'] },
      { label: '🍳 Cocina', path: '/cocina', roles: ['ADMIN', 'COCINA'] },
      { label: '💰 Caja/Facturación', path: '/pedidos', roles: ['ADMIN', 'CAJERO'] }
    ];

    this.menuItems = opciones.filter(opt => opt.roles.includes(this.rol));
    const rolSuperior = this.rol.toUpperCase();
        this.menuItems = opciones.filter(opt => opt.roles.includes(rolSuperior));

        console.log('Tu rol actual es:', rolSuperior);
        console.log('Items de menú permitidos:', this.menuItems);
  }


  logout() {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.clear();
      this.router.navigate(['/login']);
    }
  }
}
