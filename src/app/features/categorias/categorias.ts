import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CategoriaService } from '../../core/services/categoria.service';
import { WebsocketService } from '../../core/services/WebsocketService';
import { CategoriaResponseDTO, CategoriaRequestDTO } from '../../core/models/categoria.model';

@Component({
  selector: 'app-categorias',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './categorias.html',
  styleUrls: ['./categorias.css']
})
export class CategoriasComponent implements OnInit {
  categorias: CategoriaResponseDTO[] = [];
  nuevaCategoria: CategoriaRequestDTO = { nombre: '', descripcion: '' };

  private categoriaService = inject(CategoriaService);
  private wsService = inject(WebsocketService);
  private cdr = inject(ChangeDetectorRef);

  ngOnInit(): void {
    this.cargarCategorias();

    // Sincronización en tiempo real vía WebSocket
    this.wsService.getCategoriaCambios().subscribe((msg: any) => {
      console.log('🔄 Actualización recibida:', msg.evento);
      this.cargarCategorias(); // Recarga la lista cuando hay cualquier cambio
    });
  }

  cargarCategorias(): void {
    this.categoriaService.listarTodas().subscribe({
      next: (data) => {
        this.categorias = data;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error al cargar categorías', err)
    });
  }

  agregarCategoria(): void {
    if (!this.nuevaCategoria.nombre.trim()) {
      alert('El nombre es obligatorio');
      return;
    }

    // Llamamos al servicio para guardar
    this.categoriaService.crear(this.nuevaCategoria).subscribe({
      next: (categoriaCreada: CategoriaResponseDTO) => {
        // 1. LIMPIAR el formulario
        this.nuevaCategoria = { nombre: '', descripcion: '' };

        // 2. AÑADIR a la lista local inmediatamente (esto hace que aparezca en la fila)
        // Usamos el operador spread [...] para que Angular detecte el cambio en el @for
        this.categorias = [...this.categorias, categoriaCreada];

        // 3. Notificar a Angular que hubo un cambio (opcional, pero recomendado)
        this.cdr.detectChanges();

        console.log('✅ Categoría añadida localmente:', categoriaCreada);
      },
      error: (err) => {
        console.error('Error al crear:', err);
        alert('No se pudo crear la categoría');
      }
    });
  }

  toggleEstado(cat: CategoriaResponseDTO): void {
    const nuevoEstado = !cat.activo;

    this.categoriaService.cambiarEstado(cat.id, nuevoEstado).subscribe({
      next: () => {
        // Actualizamos el objeto localmente
        cat.activo = nuevoEstado;

        // Forzamos que se refresque la vista
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error al cambiar estado', err)
    });
  }
eliminarCategoria(id: number): void {
  // 1. Confirmación de seguridad
  if (!confirm('¿Estás seguro de que deseas eliminar esta categoría?')) return;

  this.categoriaService.eliminar(id).subscribe({
    next: () => {
      // 2. Borrado reactivo local: filtramos el array para quitar el ID eliminado
      this.categorias = this.categorias.filter(cat => cat.id !== id);

      // 3. Forzar detección de cambios para actualizar el @for
      this.cdr.detectChanges();
      console.log('🗑️ Categoría eliminada localmente');
    },
    error: (err) => {
      // 4. Manejo del error que enviamos desde Java (Integridad referencial)
      console.error(err);
      alert(err.error?.message || 'No se puede eliminar la categoría porque tiene platos asociados.');
    }
  });
}
}
