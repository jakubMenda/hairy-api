import { Document, model, Model, Schema } from 'mongoose';

export interface HolidayModel extends Document {
  from: string;
  to: string;
  specialist: string;
}

export const HolidaySchema: Schema = new Schema({
  from: {
    type: String,
    required: true,
  },
  to: {
    type: String,
    required: true,
  },
  specialist: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, {
  timestamps: true,
});

export const Holiday: Model<HolidayModel> = model<HolidayModel>('Holiday', HolidaySchema);
