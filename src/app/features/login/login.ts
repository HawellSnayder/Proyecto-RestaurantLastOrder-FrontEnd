import { Component, inject, PLATFORM_ID, Inject } from '@angular/core'; // Agregamos PLATFORM_ID
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth';
import { Router } from '@angular/router';
import { LoginResponseDTO } from '../../core/models/auth.model';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class LoginComponent {
  user = '';
  password = '';
  error = '';

  private auth = inject(AuthService);
  private router = inject(Router);

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  onLogin() {
    this.auth.login({ username: this.user, password: this.password }).subscribe({
      next: (res: LoginResponseDTO) => {

        if (isPlatformBrowser(this.platformId)) {
          localStorage.setItem('token', res.token);
          localStorage.setItem('rol', res.rol);
          localStorage.setItem('username', this.user);
          localStorage.setItem('user', JSON.stringify({ username: this.user, rol: res.rol }));


          const rutaDestino = res.rol === 'ADMIN' ? '/usuarios' : '/pedidos';

          window.location.assign(rutaDestino);
        }
      },
      error: (err) => {
        console.error(err);
        this.error = 'Credenciales inválidas o error de servidor';
      }
    });
  }
}
