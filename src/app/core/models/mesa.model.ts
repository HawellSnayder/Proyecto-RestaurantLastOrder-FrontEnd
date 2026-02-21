export interface MesaResponseDTO {
  id: number;
  numero: number;
  capacidad: number;
  estado: 'LIBRE' | 'OCUPADA' | 'RESERVADA';
}

export interface MesaRequestDTO {
  numero: number;
  capacidad: number;
}

export interface MesaSocketDTO extends MesaResponseDTO {
  evento: 'CREADA' | 'ACTUALIZADA' | 'ELIMINADA';
}
