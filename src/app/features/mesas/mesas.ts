import { Component, OnInit, inject, ChangeDetectorRef, PLATFORM_ID, Inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MesaService } from '../../core/services/mesa.service';
import { WebsocketService } from '../../core/services/WebsocketService';
import { MesaResponseDTO, MesaRequestDTO, MesaSocketDTO } from '../../core/models/mesa.model';

@Component({
  selector: 'app-mesas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './mesas.html',
  styleUrls: ['./mesas.css']
})
export class MesasComponent implements OnInit {
  mesas: MesaResponseDTO[] = [];
  mostrarFormulario = false;
  // Controla qué mesa muestra sus botones de acción
  mesaActivaId: number | null = null;

  nuevaMesa: MesaRequestDTO = { numero: 0, capacidad: 4 };

  private mesaService = inject(MesaService);
  private wsService = inject(WebsocketService);
  private cdr = inject(ChangeDetectorRef);

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.cargarMesas();
      this.configurarWebsocket();
    }
  }

  // --- LÓGICA DE INTERACCIÓN DINÁMICA ---

  seleccionarMesa(id: number): void {
    // Si haces clic en la misma mesa, se cierra. Si no, se abre la nueva.
    this.mesaActivaId = (this.mesaActivaId === id) ? null : id;
  }

  ejecutarAccion(id: number, accion: 'ocupar' | 'reservar' | 'liberar'): void {
    const obs = {
      'ocupar': this.mesaService.ocupar(id),
      'reservar': this.mesaService.reservar(id),
      'liberar': this.mesaService.liberar(id)
    }[accion];

    obs.subscribe({
      next: () => {
        this.mesaActivaId = null; // Cerramos el menú al terminar
        this.cdr.detectChanges();
      }
    });
  }

  // --- MÉTODOS EXISTENTES MEJORADOS ---

  cargarMesas(): void {
    this.mesaService.listarTodas().subscribe({
      next: (data) => {
        this.mesas = data.sort((a, b) => a.numero - b.numero);
        this.cdr.detectChanges();
      }
    });
  }

  configurarWebsocket(): void {
    this.wsService.watch('/topic/mesas').subscribe((dto: any) => {
      const mesaSocket = dto as MesaSocketDTO;
      if (mesaSocket.evento === 'CREADA') this.mesas.push(mesaSocket);
      else if (mesaSocket.evento === 'ELIMINADA') this.mesas = this.mesas.filter(m => m.id !== mesaSocket.id);
      else if (mesaSocket.evento === 'ACTUALIZADA') {
        const idx = this.mesas.findIndex(m => m.id === mesaSocket.id);
        if (idx !== -1) this.mesas[idx] = mesaSocket;
      }
      this.mesas.sort((a, b) => a.numero - b.numero);
      this.cdr.detectChanges();
    });
  }

  guardarMesa(): void {
    if (this.nuevaMesa.numero <= 0) {
      this.mostrarFormulario = false;
      return;
    }
    this.mesaService.crear(this.nuevaMesa).subscribe({
      next: () => this.nuevaMesa = { numero: 0, capacidad: 4 },
      error: () => alert("Error al crear")
    });
    this.mostrarFormulario = false;
  }

  eliminarMesa(id: number, event: Event): void {
    event.stopPropagation(); // Evita que se abra el menú de la mesa
    if (confirm('¿Eliminar mesa?')) {
      this.mesaService.eliminar(id).subscribe(() => {
        this.mesas = this.mesas.filter(m => m.id !== id);
        this.cdr.detectChanges();
      });
    }
  }
}
