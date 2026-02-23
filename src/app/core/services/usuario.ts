import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UsuarioResponseDTO, CrearUsuarioRequestDTO } from '../models/usuario.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  private apiUrl = `${environment.apiUrl}/usuarios`;
  private http = inject(HttpClient);
  nuevoUsuario = {
    nombre: '',
    username: '',
    password: '',
    rolId: 2
  };

  getActivos(): Observable<UsuarioResponseDTO[]> {
    return this.http.get<UsuarioResponseDTO[]>(`${this.apiUrl}/activos`);
  }

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
