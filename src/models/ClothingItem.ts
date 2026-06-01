import { Schema, model, Document, Types } from 'mongoose';
import type { Categoria, Estilo, Temporada } from '../types';

export interface IClothingItem extends Document {
  _id: Types.ObjectId;
  userId: string;
  imageUrl: string;
  categoria: Categoria;
  subcategoria: string;
  color_principal: string;
  colores_secundarios: string[];
  estilo: Estilo;
  temporada: Temporada;
  createdAt: Date;
  updatedAt: Date;
}

const ClothingItemSchema = new Schema<IClothingItem>(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    imageUrl: {
      type: String,
      required: true,
    },
    categoria: {
      type: String,
      required: true,
      enum: ['superior', 'inferior', 'calzado', 'accesorio', 'conjunto', 'exterior'],
    },
    subcategoria: {
      type: String,
      required: true,
      trim: true,
    },
    color_principal: {
      type: String,
      required: true,
      trim: true,
    },
    colores_secundarios: {
      type: [String],
      default: [],
    },
    estilo: {
      type: String,
      required: true,
      enum: ['casual', 'formal', 'deportivo', 'elegante', 'bohemio', 'streetwear', 'vintage'],
    },
    temporada: {
      type: String,
      required: true,
      enum: ['primavera', 'verano', 'otoño', 'invierno', 'todo'],
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export const ClothingItem = model<IClothingItem>('ClothingItem', ClothingItemSchema);
