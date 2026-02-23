import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PlatoService } from '../../core/services/plato.service';
import { CategoriaService } from '../../core/services/categoria.service';
import { WebsocketService } from '../../core/services/WebsocketService';
import { PlatoResponseDTO, PlatoRequestDTO } from '../../core/models/plato.model';

@Component({
  selector: 'app-platos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './platos.html',
  styleUrls: ['./platos.css']
})
export class PlatosComponent implements OnInit {
  private platoService = inject(PlatoService);
  private categoriaService = inject(CategoriaService);
  private wsService = inject(WebsocketService);
  private cdr = inject(ChangeDetectorRef);

  platos: PlatoResponseDTO[] = [];
  categorias: any[] = [];
  archivoSeleccionado: File | null = null;
  categoriaSeleccionada: number | null = null;
  mostrarFormulario = false;

  nuevoPlato: PlatoRequestDTO = {
    nombre: '',
    precio: 0,
    categoriaId: 0,
    disponible: true
  };

  ngOnInit(): void {
    this.cargarPlatos();
    this.cargarCategorias();
    this.escucharWebsockets();
  }

  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      this.archivoSeleccionado = file;
    }
  }

  cargarPlatos() {
    this.platoService.listarTodos().subscribe(data => {
      this.platos = data;
      this.cdr.detectChanges();
    });
  }

  cargarCategorias() {
    this.categoriaService.listarTodas().subscribe(data => {
      this.categorias = data.filter(c => c.activo);
      this.cdr.detectChanges();
    });
  }

  escucharWebsockets() {
    this.wsService.getPlatoCambios().subscribe(() => {
      this.cargarPlatos();
    });
  }

  guardarPlato() {
    if (!this.nuevoPlato.nombre || this.nuevoPlato.categoriaId === 0) {
      alert('Nombre y categoría son obligatorios');
      return;
    }

    const formData = new FormData();
    formData.append('nombre', this.nuevoPlato.nombre);
    formData.append('precio', this.nuevoPlato.precio.toString());
    formData.append('categoriaId', this.nuevoPlato.categoriaId.toString());

    if (this.archivoSeleccionado) {
      formData.append('imagen', this.archivoSeleccionado);
    }

    this.platoService.crearConImagen(formData).subscribe({
      next: (res) => {
        this.nuevoPlato = { nombre: '', precio: 0, categoriaId: 0, disponible: true };
        this.archivoSeleccionado = null;
        this.cargarPlatos();
        this.cdr.detectChanges();
      },
      error: (err) => alert('Error al crear el plato con imagen')
    });
  }

  toggleDisponibilidad(plato: PlatoResponseDTO) {
    const estadoAnterior = plato.disponible;
    plato.disponible = !plato.disponible;
    this.cdr.markForCheck();
    this.platoService.cambiarDisponibilidad(plato.id, plato.disponible).subscribe({
      next: () => {
        this.cdr.detectChanges();
      },
      error: (err) => {
        plato.disponible = estadoAnterior;
        this.cdr.detectChanges();
        alert('No se pudo actualizar el estado');
      }
    });
  }
  seleccionarCategoria(id: number) {
    this.categoriaSeleccionada = id;
  }
  limpiarFiltro() {
    this.categoriaSeleccionada = null;
  }
  get platosFiltrados() {
    if (!this.categoriaSeleccionada) return this.platos;
    const catNombre = this.categorias.find(c => c.id === this.categoriaSeleccionada)?.nombre;
    return this.platos.filter(p => p.categoria === catNombre);
  }
  toggleFormulario() {
  this.mostrarFormulario = !this.mostrarFormulario;
  if (!this.mostrarFormulario) {
    this.nuevoPlato = { nombre: '', precio: 0, categoriaId: 0, disponible: true };
    this.archivoSeleccionado = null;
  }
  }
  eliminarPlato(id: number) {
    if (confirm('¿Estás seguro de que deseas eliminar este plato? Esta acción no se puede deshacer.')) {
      this.platoService.eliminar(id).subscribe({
        next: () => {
          this.platos = this.platos.filter(p => p.id !== id);
          this.cdr.detectChanges();
        },
        error: () => alert('Error al eliminar el plato')
      });
    }
  }
}
