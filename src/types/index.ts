import { Types } from 'mongoose';

export type Categoria =
  | 'superior'
  | 'inferior'
  | 'calzado'
  | 'accesorio'
  | 'conjunto'
  | 'exterior';

export type Estilo =
  | 'casual'
  | 'formal'
  | 'deportivo'
  | 'elegante'
  | 'bohemio'
  | 'streetwear'
  | 'vintage';

export type Temporada = 'primavera' | 'verano' | 'otoño' | 'invierno' | 'todo';

export interface ClothingLabels {
  categoria: Categoria;
  subcategoria: string;
  color_principal: string;
  colores_secundarios: string[];
  estilo: Estilo;
  temporada: Temporada;
}

export interface GenerateOutfitRequest {
  ocasion: string;
  userId: string;
}

export interface TryOnRequest {
  clothingId: string;
  modelImageUrl: string;
  userId: string;
}

export interface ApiResponse<T = unknown> {
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

// Extend Express Request to carry userId after auth
declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}
