import { Document, model, Model, Schema } from 'mongoose';
import {HairTypeModel} from '../hairType/model';
import {CategoryModel} from '../category/model';
import {SalonModel} from '../salon/model';

export interface ServiceModel extends Document {
  name?: string;
  description?: string;
  duration?: number;
  durationBefore?: number;
  durationAfter?: number;
  price?: number;
  priceDescription?: string;
  hairType?: string | HairTypeModel;
  category?: string | CategoryModel;
  salon?: string | SalonModel;
}

export const ServiceSchema: Schema = new Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  duration: {
    type: Number,
    required: true,
  },
  durationBefore: {
    type: Number,
    required: true,
  },
  durationAfter: {
    type: Number,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  priceDescription: {
    type: String,
    required: true,
  },
  hairType: {
    type: Schema.Types.ObjectId,
    ref: 'HairType',
    required: true,
  },
  category: {
    type: Schema.Types.ObjectId,
    ref: 'Category',
    required: true,
  },
  salon: {
    type: Schema.Types.ObjectId,
    ref: 'Salon',
    required: true,
  },
});

export const Service: Model<ServiceModel> = model<ServiceModel>('Service', ServiceSchema);
