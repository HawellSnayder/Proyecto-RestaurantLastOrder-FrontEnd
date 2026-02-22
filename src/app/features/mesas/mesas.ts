import { Component, OnInit, inject, ChangeDetectorRef, PLATFORM_ID, Inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MesaService } from '../../core/services/mesa.service';
import { PedidoService } from '../../core/services/pedido.service';
import { WebsocketService } from '../../core/services/WebsocketService';
import { MesaResponseDTO, MesaRequestDTO, MesaSocketDTO } from '../../core/models/mesa.model';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-mesas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './mesas.html',
  styleUrls: ['./mesas.css']
})
export class MesasComponent implements OnInit {
  mesas: any[] = [];
  mostrarFormulario = false;
  mesaActivaId: number | null = null;
  nuevaMesa: MesaRequestDTO = { numero: 0, capacidad: 4 };

  private mesaService = inject(MesaService);
  private pedidoService = inject(PedidoService);
  private wsService = inject(WebsocketService);
  private cdr = inject(ChangeDetectorRef);

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.cargarDatos();
      this.configurarWebsocket();
    }
  }

  // --- CARGA DE DATOS CRUZADOS ---
  cargarDatos(): void {
    // Usamos forkJoin para traer mesas y pedidos al mismo tiempo y compararlos
    forkJoin({
      mesas: this.mesaService.listarTodas(),
      pedidosActivos: this.pedidoService.listarTodos() // Asegúrate que este método traiga los CREADOS/EN_PREPARACION
    }).subscribe({
      next: (res) => {
        this.mesas = res.mesas.map(mesa => {
          // Buscamos si hay un pedido vinculado a esta mesa que no esté PAGADO ni CANCELADO
          const pedido = res.pedidosActivos.find(p =>
            p.mesaNumero === mesa.numero &&
            (p.estado === 'CREADO' || p.estado === 'EN_PREPARACION')
          );
          return {
            ...mesa,
            tienePedidoActivo: !!pedido,
            pedidoId: pedido ? pedido.id : null
          };
        }).sort((a, b) => a.numero - b.numero);
        this.cdr.detectChanges();
      }
    });
  }

  configurarWebsocket(): void {
    // Escuchar cambios en mesas
    this.wsService.watch('/topic/mesas').subscribe(() => {
      this.cargarDatos();
    });

    // Escuchar cambios en pedidos (si un pedido cambia a 'PAGADO', la mesa se debe poder liberar)
    this.wsService.getPedidoCambios().subscribe(() => {
      this.cargarDatos();
    });
  }

  // --- ACCIONES ---
  seleccionarMesa(id: number): void {
    this.mesaActivaId = (this.mesaActivaId === id) ? null : id;
  }

  ejecutarAccion(id: number, accion: 'ocupar' | 'reservar' | 'liberar'): void {
    // Si intentan liberar una mesa con pedido, bloqueamos
    const mesa = this.mesas.find(m => m.id === id);
    if (accion === 'liberar' && mesa?.tienePedidoActivo) {
      alert(`⛔ No puedes liberar la Mesa ${mesa.numero} porque tiene un pedido pendiente de pago.`);
      this.mesaActivaId = null;
      return;
    }

    const obs = {
      'ocupar': this.mesaService.ocupar(id),
      'reservar': this.mesaService.reservar(id),
      'liberar': this.mesaService.liberar(id)
    }[accion];

    obs.subscribe({
      next: () => {
        this.mesaActivaId = null;
        this.cargarDatos(); // Recargamos para refrescar estados
      }
    });
  }

  guardarMesa(): void {
    if (this.nuevaMesa.numero <= 0) {
      this.mostrarFormulario = false;
      return;
    }
    this.mesaService.crear(this.nuevaMesa).subscribe({
      next: () => {
        this.nuevaMesa = { numero: 0, capacidad: 4 };
        this.mostrarFormulario = false;
      }
    });
  }

  eliminarMesa(id: number, event: Event): void {
    event.stopPropagation();
    const mesa = this.mesas.find(m => m.id === id);
    if (mesa?.tienePedidoActivo) {
      alert("No puedes eliminar una mesa con pedidos activos.");
      return;
    }
    if (confirm('¿Eliminar mesa permanentemente?')) {
      this.mesaService.eliminar(id).subscribe();
    }
  }
}
