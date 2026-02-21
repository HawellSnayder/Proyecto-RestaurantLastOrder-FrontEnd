import { Injectable, inject } from '@angular/core'; // Usando inject para estar al día con Angular 18+
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UsuarioResponseDTO, CrearUsuarioRequestDTO } from '../models/usuario.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  private apiUrl = `${environment.apiUrl}/usuarios`;
  private http = inject(HttpClient); // Sintaxis moderna
  nuevoUsuario = {
    nombre: '',
    username: '',
    password: '',
    rolId: 2 // Cambiamos 'rol' por 'rolId' (2 suele ser MESERO)
  };

  // Obtiene la lista (Asegúrate que el DTO en Java ya incluya el campo "nombre")
  getActivos(): Observable<UsuarioResponseDTO[]> {
    return this.http.get<UsuarioResponseDTO[]>(`${this.apiUrl}/activos`);
  }

  // Usamos el DTO específico para creación
  crearUsuario(usuario: CrearUsuarioRequestDTO): Observable<UsuarioResponseDTO> {
    return this.http.post<UsuarioResponseDTO>(this.apiUrl, usuario);
  }
  limpiarFormulario() {
    this.nuevoUsuario = {
      nombre: '',
      username: '',
      password: '',
      rolId: 2
    };
  }
  desactivarUsuario(id: number): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/${id}/desactivar`, {});
  }
  listarTodos(): Observable<UsuarioResponseDTO[]> {
    return this.http.get<UsuarioResponseDTO[]>(this.apiUrl);
  }
  activar(id: number): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/${id}/activar`, {});
  }
  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

}
