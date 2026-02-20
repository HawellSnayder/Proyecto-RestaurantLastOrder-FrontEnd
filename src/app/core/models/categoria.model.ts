// src/app/core/models/categoria.model.ts
export interface CategoriaResponseDTO {
  id: number;
  nombre: string;
  descripcion: string;
  activo: boolean;
}

export interface CategoriaRequestDTO {
  nombre: string;
  descripcion: string;
}
