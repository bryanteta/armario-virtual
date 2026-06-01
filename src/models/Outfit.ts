import { Schema, model, Document, Types } from 'mongoose';

export interface IOutfit extends Document {
  _id: Types.ObjectId;
  userId: string;
  prendas: Types.ObjectId[];
  ocasion: string;
  justificacion: string;
  createdAt: Date;
  updatedAt: Date;
}

const OutfitSchema = new Schema<IOutfit>(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    prendas: [
      {
        type: Schema.Types.ObjectId,
        ref: 'ClothingItem',
        required: true,
      },
    ],
    ocasion: {
      type: String,
      required: true,
      trim: true,
    },
    justificacion: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export const Outfit = model<IOutfit>('Outfit', OutfitSchema);
