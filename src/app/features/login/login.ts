import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // Necesario para [(ngModel)]
import { AuthService } from '../../core/services/auth';
import { Router } from '@angular/router';
import { LoginResponseDTO } from '../../core/models/auth.model';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule], // Importante agregarlos aquí
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class LoginComponent {
  user = '';
  password = '';
  error = '';

  constructor(private auth: AuthService, private router: Router) {}

  onLogin() {
    this.auth.login({ username: this.user, password: this.password }).subscribe({
      next: (res: LoginResponseDTO) => {
        if (res.rol === 'ADMIN') this.router.navigate(['/usuarios']);
        else this.router.navigate(['/pedidos']);
      },
      error: () => this.error = 'Credenciales inválidas'
    });
  }
}
