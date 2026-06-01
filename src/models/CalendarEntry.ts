import { Schema, model, Document, Types } from 'mongoose';

export interface ICalendarEntry extends Document {
  _id: Types.ObjectId;
  userId: string;
  date: string; // YYYY-MM-DD
  outfitId: Types.ObjectId;
  notas: string;
  createdAt: Date;
  updatedAt: Date;
}

const CalendarEntrySchema = new Schema<ICalendarEntry>(
  {
    userId: { type: String, required: true, index: true },
    date: { type: String, required: true }, // YYYY-MM-DD
    outfitId: { type: Schema.Types.ObjectId, ref: 'Outfit', required: true },
    notas: { type: String, default: '' },
  },
  { timestamps: true, versionKey: false }
);

CalendarEntrySchema.index({ userId: 1, date: 1 }, { unique: true });

export const CalendarEntry = model<ICalendarEntry>('CalendarEntry', CalendarEntrySchema);
