import { Document, model, Model, Schema } from 'mongoose';

export interface HairTypeModel extends Document {
    type?: string;
}

export const HairTypeSchema: Schema = new Schema({
    type: {
      type: String,
      required: true,
      trim: true,
      maxLength: 10,
    },
});

export const HairType: Model<HairTypeModel> = model<HairTypeModel>('HairType', HairTypeSchema);
