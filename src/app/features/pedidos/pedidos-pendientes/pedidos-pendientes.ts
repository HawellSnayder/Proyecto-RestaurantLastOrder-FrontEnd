import { Component, OnInit, inject, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PedidoService } from '../../../core/services/pedido.service';
import { WebsocketService } from '../../../core/services/WebsocketService';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-pedidos-pendientes',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pedidos-pendientes.html',
  styleUrls: ['./pedidos-pendientes.css']
})
export class PedidosPendientesComponent implements OnInit, OnDestroy {
  pedidos: any[] = [];
  filtroActual: string = 'CREADO';

  // Guardamos la suscripción para poder limpiarla
  private pedidoSub: Subscription | null = null;

  // Seguridad y Roles
  esMesero: boolean = false;
  esAdmin: boolean = false;

  // Modal Yape
  mostrarYape: boolean = false;
  pedidoParaPagar: any = null;
  numeroYape: string = '949808670';

  private pedidoService = inject(PedidoService);
  private wsService = inject(WebsocketService);
  private cdr = inject(ChangeDetectorRef);
  private router = inject(Router);

  ngOnInit() {
    this.verificarRol();
    this.cargarPedidos(this.filtroActual);

    // Sockets: Solo recargamos si el evento afecta a la lista que estamos viendo
    this.pedidoSub = this.wsService.watch('/topic/pedidos').subscribe(() => {
      this.cargarPedidos(this.filtroActual);
    });
  }

  ngOnDestroy() {
    if (this.pedidoSub) this.pedidoSub.unsubscribe();
  }

  verificarRol() {
    const userStr = localStorage.getItem('usuario');
    if (userStr) {
      const user = JSON.parse(userStr);
      const rol = user.rol?.nombre;
      this.esMesero = rol === 'MESERO';
      this.esAdmin = rol === 'ADMIN';
    }
  }

  cargarPedidos(estado: string) {
    // Bloqueamos el filtro actual antes de la petición para que no se mueva la pestaña
    this.filtroActual = estado;
    this.pedidoService.listarPorEstado(estado).subscribe({
      next: (data) => {
        this.pedidos = data;
        this.cdr.detectChanges();
      },
      error: (err) => console.error("Error al cargar pedidos:", err)
    });
  }

  editarPedido(pedido: any) {
    this.router.navigate(['/dashboard/nuevo-pedido'], { queryParams: { id: pedido.id } });
  }

  getSiguienteEstado(actual: string): string {
    const flujos: any = {
      'CREADO': 'EN_PREPARACION',
      'EN_PREPARACION': 'LISTO',
      'LISTO': 'ENTREGADO',
      'ENTREGADO': 'PAGADO'
    };
    return flujos[actual] || '';
  }

  avanzarEstado(pedido: any) {
    const proximo = this.getSiguienteEstado(pedido.estado);

    if (proximo === 'PAGADO') {
      this.pedidoParaPagar = pedido;
      this.mostrarYape = true;
    } else {
      // Al avanzar, el pedido DESAPARECERÁ de la pestaña actual.
      // Esto es correcto porque ya no pertenece a ese filtro.
      this.pedidoService.cambiarEstado(pedido.id, proximo).subscribe({
        next: () => {
          this.cargarPedidos(this.filtroActual);
        },
        error: (err) => alert("No se pudo cambiar el estado: " + err.error?.message)
      });
    }
  }

  confirmarPago() {
    if (!this.pedidoParaPagar) return;

    this.pedidoService.cambiarEstado(this.pedidoParaPagar.id, 'PAGADO').subscribe({
      next: () => {
        this.mostrarYape = false;
        this.pedidoParaPagar = null;

        // RECOMENDACIÓN: Después de pagar, saltamos automáticamente a la pestaña PAGADO (Historial)
        // para que el usuario vea que el registro se guardó correctamente.
        this.cargarPedidos('PAGADO');

        alert('✅ Pago registrado con éxito');
      },
      error: (err) => {
        console.error("Error al pagar", err);
        alert('Error al procesar el pago. Revisa la consola para más detalles.');
      }
    });
  }
}
