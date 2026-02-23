

export interface PlatoResponseDTO {
  id: number;
  nombre: string;
  precio: number;
  categoria: string;
  disponible: boolean;
  imagenBase64?: string;
}

export interface PlatoRequestDTO {
  nombre: string;
  precio: number;
  categoriaId: number;
  disponible: boolean;
}

export interface PlatoSocketDTO {
  id: number;
  nombre: string;
  precio: number;
  categoriaId: number;
  categoriaNombre: string;
  disponible: boolean;
  imagenBase64?: string;
  evento: 'CREADO' | 'ACTUALIZADO' | 'DISPONIBILIDAD_CAMBIADA';
}
