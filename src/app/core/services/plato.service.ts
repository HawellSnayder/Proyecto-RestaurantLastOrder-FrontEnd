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

  // src/app/core/services/plato.service.ts

  crearConImagen(formData: FormData): Observable<PlatoResponseDTO> {
    // NO añadas headers manualmente, Angular lo hace solo al ver el FormData
    return this.http.post<PlatoResponseDTO>(this.apiUrl, formData);
  }

  actualizar(id: number, dto: PlatoRequestDTO): Observable<PlatoResponseDTO> {
    return this.http.put<PlatoResponseDTO>(`${this.apiUrl}/${id}`, dto);
  }

  cambiarDisponibilidad(id: number, disponible: boolean): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/${id}/disponibilidad?disponible=${disponible}`, {});
  }
  listarTodos(): Observable<PlatoResponseDTO[]> {
    return this.http.get<PlatoResponseDTO[]>(this.apiUrl); // Apunta al @GetMapping base
  }
  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
