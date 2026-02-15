// src/app/features/usuarios/usuarios.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UsuarioService } from '../../core/services/usuario'; // <--- VERIFICA ESTA RUTA
import { UsuarioResponseDTO } from '../../core/models/usuario.model';
import { inject } from '@angular/core';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './usuarios.html',
  styleUrls: ['./usuarios.css']
})
export class UsuariosComponent implements OnInit {
  usuarios: UsuarioResponseDTO[] = [];

  // Al poner 'private', Angular busca el 'Injection Token' automáticamente
  private usuarioService = inject(UsuarioService);

  ngOnInit(): void {
    this.usuarioService.getActivos().subscribe({
      next: (data) => {
        this.usuarios = data; // <--- Aquí se asignan los datos
        console.log('Datos guardados en la variable:', this.usuarios);
      }
    });
  }
}
