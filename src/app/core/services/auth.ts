import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { LoginRequestDTO, LoginResponseDTO } from '../models/auth.model';
import { tap } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth/login`;

  constructor(private http: HttpClient) {}

  login(credentials: LoginRequestDTO): Observable<LoginResponseDTO> {
    return this.http.post<LoginResponseDTO>(this.apiUrl, credentials).pipe(
      tap(res => {
        // Limpieza preventiva: borra lo viejo antes de poner lo nuevo
        const cleanToken = res.token.trim().replace(/^"|"$/g, '');
        localStorage.clear();
        localStorage.setItem('token', cleanToken);
        localStorage.setItem('rol', res.rol);
        localStorage.setItem('username', res.username);
      })
    );
  }
}
