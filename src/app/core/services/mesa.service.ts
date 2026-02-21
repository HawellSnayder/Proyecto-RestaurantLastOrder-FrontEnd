import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { MesaResponseDTO, MesaRequestDTO } from '../models/mesa.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class MesaService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/mesas`;

  listarTodas(): Observable<MesaResponseDTO[]> {
    return this.http.get<MesaResponseDTO[]>(this.apiUrl);
  }

  crear(dto: MesaRequestDTO): Observable<MesaResponseDTO> {
    return this.http.post<MesaResponseDTO>(this.apiUrl, dto);
  }

  actualizar(id: number, dto: MesaRequestDTO): Observable<MesaResponseDTO> {
    return this.http.put<MesaResponseDTO>(`${this.apiUrl}/${id}`, dto);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // Métodos de cambio de estado
  reservar(id: number): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/${id}/reservar`, {});
  }

  ocupar(id: number): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/${id}/ocupar`, {});
  }

  liberar(id: number): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/${id}/liberar`, {});
  }
}
