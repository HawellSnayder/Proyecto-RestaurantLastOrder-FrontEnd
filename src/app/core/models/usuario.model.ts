// Coincide con UsuarioResponseDTO
export interface UsuarioResponseDTO {
  id: number;
  username: string;
  rol: string; // Aquí llega directo "ADMIN", "MESERO", etc.
}

// Coincide con CrearUsuarioRequestDTO
export interface CrearUsuarioRequestDTO {
  nombre: string;
  username: string;
  password: string;
  rolId: number;
}
