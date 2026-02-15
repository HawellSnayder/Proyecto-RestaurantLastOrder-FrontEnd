// Coincide con LoginRequestDTO
export interface LoginRequestDTO {
  username: string;
  password: string;
}

// Coincide con LoginResponseDTO
export interface LoginResponseDTO {
  token: string;
  username: string;
  rol: string;
}
