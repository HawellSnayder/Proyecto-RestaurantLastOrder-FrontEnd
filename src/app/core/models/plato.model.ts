// src/app/core/models/plato.model.ts

export interface PlatoResponseDTO {
  id: number;
  nombre: string;
  precio: number;
  categoria: string;
  disponible: boolean;
  imagenBase64?: string; // <--- Asegúrate de que esta línea esté presente
}

export interface PlatoRequestDTO {
  nombre: string;
  precio: number;
  categoriaId: number;
  disponible: boolean;
  // Nota: Para el envío usamos FormData en el servicio,
  // pero esta interfaz sirve para mantener la estructura en el componente.
}

export interface PlatoSocketDTO {
  id: number;
  nombre: string;
  precio: number;
  categoriaId: number;
  categoriaNombre: string;
  disponible: boolean;
  imagenBase64?: string; // 🔥 También lo agregamos para actualizaciones en tiempo real
  evento: 'CREADO' | 'ACTUALIZADO' | 'DISPONIBILIDAD_CAMBIADA';
}
