import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CategoriaResponseDTO, CategoriaRequestDTO } from '../models/categoria.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CategoriaService {
  private apiUrl = `${environment.apiUrl}/categorias`;
  private http = inject(HttpClient);

  // GET /api/categorias
  listarTodas(): Observable<CategoriaResponseDTO[]> {
    return this.http.get<CategoriaResponseDTO[]>(this.apiUrl);
  }

  // GET /api/categorias/activas
  listarActivas(): Observable<CategoriaResponseDTO[]> {
    return this.http.get<CategoriaResponseDTO[]>(`${this.apiUrl}/activas`);
  }

  // POST /api/categorias
  crear(dto: CategoriaRequestDTO): Observable<CategoriaResponseDTO> {
    return this.http.post<CategoriaResponseDTO>(this.apiUrl, dto);
  }

  // PUT /api/categorias/{id}
  actualizar(id: number, dto: CategoriaRequestDTO): Observable<CategoriaResponseDTO> {
    return this.http.put<CategoriaResponseDTO>(`${this.apiUrl}/${id}`, dto);
  }

  // PATCH /api/categorias/{id}/estado?activo=...
  cambiarEstado(id: number, activo: boolean): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/${id}/estado`, null, {
      params: { activo: activo.toString() }
    });
  }
  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
