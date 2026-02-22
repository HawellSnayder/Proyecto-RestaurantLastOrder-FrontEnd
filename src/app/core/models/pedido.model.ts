export interface DetallePedidoRequestDTO {
  platoId: number;
  cantidad: number;
}

export interface PedidoRequestDTO {
  mesaNumero: number;
  detalles: DetallePedidoRequestDTO[];
  observaciones?: string;
}

export interface DetallePedidoResponseDTO {
  platoId: number;
  plato: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

export interface PedidoResponseDTO {
  id: number;
  mesaNumero: number;
  mesero: string;
  estado: string;
  total: number;
  observaciones: string;
  fechaCreacion: string;
  detalles: DetallePedidoResponseDTO[];
}
