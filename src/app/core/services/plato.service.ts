import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PlatoRequestDTO, PlatoResponseDTO } from '../models/plato.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PlatoService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/platos`;

  listarDisponibles(): Observable<PlatoResponseDTO[]> {
    return this.http.get<PlatoResponseDTO[]>(`${this.apiUrl}/disponibles`);
  }


  crearConImagen(formData: FormData): Observable<PlatoResponseDTO> {
    return this.http.post<PlatoResponseDTO>(this.apiUrl, formData);
  }

  actualizar(id: number, dto: PlatoRequestDTO): Observable<PlatoResponseDTO> {
    return this.http.put<PlatoResponseDTO>(`${this.apiUrl}/${id}`, dto);
  }

  cambiarDisponibilidad(id: number, disponible: boolean): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/${id}/disponibilidad?disponible=${disponible}`, {});
  }
  listarTodos(): Observable<PlatoResponseDTO[]> {
    return this.http.get<PlatoResponseDTO[]>(this.apiUrl);
  }
  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
