import { Component, OnInit, inject, ChangeDetectorRef, PLATFORM_ID, Inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { UsuarioService } from '../../core/services/usuario';
import { UsuarioResponseDTO, CrearUsuarioRequestDTO } from '../../core/models/usuario.model';
import { FormsModule } from '@angular/forms';
import { WebsocketService } from '../../core/services/WebsocketService';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './usuarios.html',
  styleUrls: ['./usuarios.css']
})
export class UsuariosComponent implements OnInit {
  usuarios: UsuarioResponseDTO[] = [];
  mostrarFormulario = false;
  cargando = true;

  nuevoUsuario: CrearUsuarioRequestDTO = {
    nombre: '',
    username: '',
    password: '',
    rolId: 2
  };

  private usuarioService = inject(UsuarioService);
  private cdr = inject(ChangeDetectorRef);
  private wsService = inject(WebsocketService);

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  private inicializarComponente(): void {
      this.cargarUsuarios();

      this.wsService.getDesactivaciones().subscribe({
        next: (idRecibido) => {
          if (idRecibido) {
            this.cargarUsuarios();
          }
        }
      });
    }
  ngOnInit(): void {
      if (isPlatformBrowser(this.platformId)) {
        this.inicializarComponente();
      }
    }

  cargarUsuarios(): void {
      this.cargando = true;
      this.usuarioService.listarTodos().subscribe({
        next: (data: UsuarioResponseDTO[]) => {
          this.usuarios = data;
          this.cargando = false;
          setTimeout(() => {
            this.cdr.markForCheck();
            this.cdr.detectChanges();
          }, 0);
        },
        error: (err) => {
          console.error('Error al cargar:', err);
          this.cargando = false;
          this.cdr.detectChanges();
        }
      });
    }

  toggleEstado(u: UsuarioResponseDTO) {
    const proximoEstado = !u.activo;
    const accionTexto = proximoEstado ? 'activar' : 'desactivar';

    if (confirm(`¿Estás seguro de ${accionTexto} a ${u.nombre || u.username}?`)) {
      if (proximoEstado) {
        // Lógica para ACTIVAR
        this.usuarioService.activar(u.id).subscribe({
          next: () => {
            u.activo = true;
            this.cdr.detectChanges();
          },
          error: (err) => alert('Error al activar el usuario')
        });
      } else {
        // Lógica para DESACTIVAR
        this.usuarioService.desactivarUsuario(u.id).subscribe({
          next: () => {
            u.activo = false;
            this.cdr.detectChanges();
          },
          error: (err) => alert('Error al desactivar el usuario')
        });
      }
    }
  }

  eliminarUsuario(id: number, username: string) {
    if (confirm(`⚠️ ¿ELIMINAR PERMANENTEMENTE a @${username}?\nEsta acción no se puede deshacer y fallará si el usuario tiene historial.`)) {
      this.usuarioService.eliminar(id).subscribe({
        next: () => {
          this.usuarios = this.usuarios.filter(u => u.id !== id);
          this.cdr.detectChanges();
        },
        error: (err) => {
          alert('No se puede eliminar: El usuario tiene registros asociados. Use "Desactivar".');
        }
      });
    }
  }

  registrarUsuario() {
    if (!this.nuevoUsuario.nombre || !this.nuevoUsuario.username || !this.nuevoUsuario.password) {
      alert('Todos los campos son obligatorios');
      return;
    }
    this.usuarioService.crearUsuario(this.nuevoUsuario).subscribe({
      next: () => {
        this.cargarUsuarios();
        this.toggleFormulario();
      },
      error: () => alert('Error al crear el usuario')
    });
  }

  toggleFormulario() {
    this.mostrarFormulario = !this.mostrarFormulario;
    if (!this.mostrarFormulario) this.limpiarFormulario();
  }

  limpiarFormulario() {
    this.nuevoUsuario = { nombre: '', username: '', password: '', rolId: 2 };
  }
}
