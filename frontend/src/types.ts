export type Categoria = 'superior' | 'inferior' | 'calzado' | 'accesorio' | 'conjunto' | 'exterior';
export type Estilo = 'casual' | 'formal' | 'deportivo' | 'elegante' | 'bohemio' | 'streetwear' | 'vintage';
export type Temporada = 'primavera' | 'verano' | 'otoño' | 'invierno' | 'todo';

export interface ClothingItem {
  _id: string;
  userId: string;
  imageUrl: string;
  categoria: Categoria;
  subcategoria: string;
  color_principal: string;
  colores_secundarios: string[];
  estilo: Estilo;
  temporada: Temporada;
  createdAt: string;
}

export interface Outfit {
  _id: string;
  userId: string;
  prendas: ClothingItem[];
  ocasion: string;
  justificacion: string;
  createdAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  total: number;
  page: number;
  limit: number;
}
