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

  listarTodas(): Observable<CategoriaResponseDTO[]> {
    return this.http.get<CategoriaResponseDTO[]>(this.apiUrl);
  }

  listarActivas(): Observable<CategoriaResponseDTO[]> {
    return this.http.get<CategoriaResponseDTO[]>(`${this.apiUrl}/activas`);
  }

  crear(dto: CategoriaRequestDTO): Observable<CategoriaResponseDTO> {
    return this.http.post<CategoriaResponseDTO>(this.apiUrl, dto);
  }

  actualizar(id: number, dto: CategoriaRequestDTO): Observable<CategoriaResponseDTO> {
    return this.http.put<CategoriaResponseDTO>(`${this.apiUrl}/${id}`, dto);
  }

  cambiarEstado(id: number, activo: boolean): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/${id}/estado`, null, {
      params: { activo: activo.toString() }
    });
  }
  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
