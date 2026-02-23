import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PedidoRequestDTO, PedidoResponseDTO } from '../models/pedido.model';

@Injectable({ providedIn: 'root' })
export class PedidoService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/pedidos`;

  listarTodos(): Observable<PedidoResponseDTO[]> {
    return this.http.get<PedidoResponseDTO[]>(this.apiUrl);
  }

  crear(pedido: PedidoRequestDTO): Observable<PedidoResponseDTO> {
    return this.http.post<PedidoResponseDTO>(this.apiUrl, pedido);
  }

  cambiarEstado(id: number, estado: string): Observable<PedidoResponseDTO> {
    return this.http.patch<PedidoResponseDTO>(`${this.apiUrl}/${id}/estado?estado=${estado}`, {});
  }

  listarPorEstado(estado: string): Observable<PedidoResponseDTO[]> {
    return this.http.get<PedidoResponseDTO[]>(`${this.apiUrl}?estado=${estado}`);
  }

  obtenerPorId(id: number): Observable<PedidoResponseDTO> {
    return this.http.get<PedidoResponseDTO>(`${this.apiUrl}/${id}`);
  }

  actualizar(id: number, pedido: any): Observable<any> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.put(url, pedido);
  }
}
