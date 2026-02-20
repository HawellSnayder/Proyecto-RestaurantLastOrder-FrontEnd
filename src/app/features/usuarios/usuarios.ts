import { Component, OnInit, inject, ChangeDetectorRef, PLATFORM_ID, Inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common'; // <-- Importar isPlatformBrowser
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

  nuevoUsuario: CrearUsuarioRequestDTO = {
    nombre: '',
    username: '',
    password: '',
    rolId: 2
  };

  // Inyecciones
  private usuarioService = inject(UsuarioService);
  private cdr = inject(ChangeDetectorRef);
  private wsService = inject(WebsocketService);

  // Constructor necesario para capturar el ID de la plataforma (SSR)
  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngOnInit(): void {
    // 1. Verificamos que estamos en el navegador para evitar errores de SSR
    if (isPlatformBrowser(this.platformId)) {
      this.cargarUsuarios();

      // 2. Escuchamos al WebSocket para actualizar la tabla en tiempo real
      this.wsService.getDesactivaciones().subscribe((idAEliminar) => {
        console.log('Filtrando usuario con ID:', idAEliminar);
        this.usuarios = this.usuarios.filter(u => u.id !== idAEliminar);
        this.cdr.detectChanges(); // Forzamos el refresco de la vista
      });
    }
  }

  cargarUsuarios(): void {
    this.usuarioService.getActivos().subscribe({
      next: (data: UsuarioResponseDTO[]) => {
        this.usuarios = data;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error al cargar usuarios:', err)
    });
  }

  // Método para desactivar (Llamado desde el botón de la tabla)
  desactivarUsuario(u: UsuarioResponseDTO) {
    if (confirm(`¿Estás seguro de desactivar a ${u.nombre || u.username}?`)) {
      this.usuarioService.desactivarUsuario(u.id).subscribe({
        next: () => {
          // El WebSocket recibirá el mensaje y filtrará la lista automáticamente
          console.log('Desactivación exitosa en servidor');
        },
        error: (err) => {
          console.error(err);
          alert('Error al intentar desactivar');
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
        alert('Usuario guardado con éxito');
        this.cargarUsuarios();
        this.toggleFormulario();
      },
      error: (err) => alert('Error al crear el usuario')
    });
  }

  toggleFormulario() {
    this.mostrarFormulario = !this.mostrarFormulario;
    if (!this.mostrarFormulario) this.limpiarFormulario();
  }

  limpiarFormulario() {
    this.nuevoUsuario = {
      nombre: '',
      username: '',
      password: '',
      rolId: 2
    };
  }
}
