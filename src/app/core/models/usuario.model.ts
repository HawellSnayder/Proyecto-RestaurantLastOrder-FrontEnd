
export interface UsuarioResponseDTO {
  id: number;
  nombre: string;
  username: string;
  activo: boolean;
  rol: string;
}

export interface CrearUsuarioRequestDTO {
  nombre: string;
  username: string;
  password: string;
  rolId: number;
}
