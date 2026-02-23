import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MesaService } from '../../../core/services/mesa.service';
import { PedidoService } from '../../../core/services/pedido.service';
import { PlatoService } from '../../../core/services/plato.service';
import { CategoriaService } from '../../../core/services/categoria.service';
import { WebsocketService } from '../../../core/services/WebsocketService';
import { PedidoResponseDTO,PedidoRequestDTO } from '../../../core/models/pedido.model';
import { PlatoResponseDTO } from '../../../core/models/plato.model';

@Component({
  selector: 'app-crear-pedido',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './crear-pedido.html',
  styleUrls: ['./crear-pedido.css']
})
export class CrearPedidoComponent implements OnInit {
  // 1. PROPIEDADES
  mostrarPasos = false;
  pasoActual = 1;
  mostrarModalEstado = false;
  mensajeModal = '';
  misPedidos: PedidoResponseDTO[] = [];
  mesasLibres: any[] = [];
  platos: PlatoResponseDTO[] = [];
  categorias: any[] = [];
  platosFiltrados: PlatoResponseDTO[] = [];
  terminoBusqueda: string = '';
  categoriaSeleccionadaId: number | null = null;
  carrito: any[] = [];
  mesaSeleccionada: any = null;
  observaciones: string = '';
  pedidoEnCursoId: number | null = null;


  private mesaService = inject(MesaService);
  private pedidoService = inject(PedidoService);
  private platoService = inject(PlatoService);
  private categoriaService = inject(CategoriaService);
  private wsService = inject(WebsocketService);
  private cdr = inject(ChangeDetectorRef);



  public agregarAlCarrito(plato: PlatoResponseDTO): void {
    // Según tu interfaz PlatoResponseDTO, el campo ES 'id'
    const idFinal = plato.id;

    const index = this.carrito.findIndex(item => item.platoId === idFinal);

    if (index !== -1) {
      this.carrito[index].cantidad++;
    } else {
      this.carrito.push({
        platoId: idFinal,
        nombre: plato.nombre,
        cantidad: 1,
        precio: plato.precio
      });
    }
    this.cdr.detectChanges();
  }

  public aumentarCantidad(index: number): void {
      if (this.carrito[index]) {
        this.carrito[index].cantidad++;
        this.cdr.detectChanges();
      }
    }
  public quitarUno(index: number): void {
      if (this.carrito[index]) {
        if (this.carrito[index].cantidad > 1) {
          this.carrito[index].cantidad--;
        } else {
          this.eliminarDelCarrito(index);
        }
        this.cdr.detectChanges();
      }
    }

  public eliminarDelCarrito(index: number): void {
      this.carrito.splice(index, 1); // Elimina exactamente esa fila
      this.cdr.detectChanges();
    }

  public calcularTotal(): number {
    return this.carrito.reduce((acc, i) => acc + (i.precio * i.cantidad), 0);
  }

  // 4. CICLO DE VIDA Y OTROS
  ngOnInit() {
    this.cargarMisPedidos();
    this.cargarCategorias();
    this.cargarPlatos();
    this.configurarSockets();
  }

  cargarMisPedidos() {
    this.pedidoService.listarTodos().subscribe(data => {
      this.misPedidos = data.filter(p => p.estado !== 'PAGADO' && p.estado !== 'CANCELADO');
      this.cdr.detectChanges();
    });
  }

  cargarCategorias() {
    this.categoriaService.listarActivas().subscribe(data => this.categorias = data);
  }

  cargarPlatos() {
    this.platoService.listarDisponibles().subscribe(data => {
      this.platos = data;
      this.aplicarFiltros();
    });
  }

  cargarMesas() {
    this.mesaService.listarTodas().subscribe(data => {
      this.mesasLibres = data.filter(m => m.estado === 'LIBRE');
      this.cdr.detectChanges();
    });
  }

  configurarSockets() {
    this.wsService.getPedidoCambios().subscribe((pedidoActualizado: any) => {
      this.cargarMisPedidos();
      if (this.pedidoEnCursoId === pedidoActualizado.id && pedidoActualizado.estado !== 'CREADO') {
        this.activarBloqueoPorEstado(pedidoActualizado);
      }
    });
    this.wsService.getMesaCambios().subscribe(() => this.cargarMesas());
  }

  activarBloqueoPorEstado(pedido: any) {
    this.mensajeModal = `Mesa ${pedido.mesaNumero} ahora está en ${pedido.estado}.`;
    this.mostrarModalEstado = true;
    setTimeout(() => this.cerrarModalYSalir(), 3000);
  }

  cerrarModalYSalir() {
    this.mostrarModalEstado = false;
    this.mostrarPasos = false;
    this.reset();
  }

  aplicarFiltros() {
    const termino = this.terminoBusqueda.toLowerCase().trim();
    const cat = this.categorias.find(c => c.id === this.categoriaSeleccionadaId);
    this.platosFiltrados = this.platos.filter(p => {
      const matchNombre = p.nombre.toLowerCase().includes(termino);
      const matchCat = !cat || p.categoria === cat.nombre;
      return matchNombre && matchCat;
    });
    this.cdr.detectChanges();
  }

  seleccionarCategoria(id: number | null) {
    this.categoriaSeleccionadaId = id;
    this.aplicarFiltros();
  }

  iniciarNuevoPedido() {
    this.reset();
    this.mostrarPasos = true;
    this.pasoActual = 1;
    this.cargarMesas();
  }

  seleccionarMesa(mesa: any) {
    this.mesaSeleccionada = mesa;
    this.pasoActual = 2;
  }

  verDetalles(pedido: PedidoResponseDTO) {
    if (pedido.estado !== 'CREADO') return;
    this.reset();
    this.mostrarPasos = true;
    this.pasoActual = 2;
    this.pedidoEnCursoId = pedido.id;
    this.mesaSeleccionada = { numero: pedido.mesaNumero };
    this.observaciones = pedido.observaciones;

    // Según tu interfaz DetallePedidoResponseDTO, el campo ES 'platoId'
    this.carrito = pedido.detalles.map(det => ({
      platoId: det.platoId,
      nombre: det.plato,
      cantidad: det.cantidad,
      precio: det.precioUnitario
    }));
    this.cdr.detectChanges();
  }


  enviarPedido() {
    if (this.carrito.length === 0 || !this.mesaSeleccionada) return;

    // Construimos el objeto cumpliendo estrictamente con PedidoRequestDTO
    const request: PedidoRequestDTO = {
      mesaNumero: this.mesaSeleccionada.numero,
      observaciones: this.observaciones,
      detalles: this.carrito.map(item => ({
        platoId: item.platoId,
        cantidad: item.cantidad
      }))
    };

    if (this.pedidoEnCursoId) {
      this.pedidoService.actualizar(this.pedidoEnCursoId, request).subscribe({
        next: () => {
          alert("¡Pedido actualizado!");
          this.cancelarNuevo();
          this.cargarMisPedidos();
        },
        error: (err) => console.error("Error:", err)
      });
    } else {
      this.pedidoService.crear(request).subscribe({
        next: () => {
          alert("¡Pedido creado!");
          this.cancelarNuevo();
          this.cargarMisPedidos();
        },
        error: (err) => console.error("Error:", err)
      });
    }
  }

  cancelarNuevo() {
    this.mostrarPasos = false;
    this.reset();
  }

  reset() {
    this.carrito = [];
    this.mesaSeleccionada = null;
    this.pasoActual = 1;
    this.pedidoEnCursoId = null;
    this.cdr.detectChanges();
  }
}
