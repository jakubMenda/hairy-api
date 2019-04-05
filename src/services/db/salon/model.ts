import { Document, model, Model, Schema } from 'mongoose';
import { UserModel } from '../users/model';
import {ServiceModel} from '../service/model';

export interface SalonModel extends Document {
  name?: string;
  city?: string;
  street?: string;
  postCode?: string;
  houseNumber?: string;
  phone?: string;
  manager?: string | UserModel;
  deposit?: number;
  serviceCancelDate?: Date;
  lastEditBy?: string | UserModel;
  lastEdit?: Date;
  specialists?: Array<string | UserModel>;
  services?: Array<string | ServiceModel>;
}

export const SalonSchema: Schema = new Schema({
  name: {
    type: String,
    required: true,
  },
  city: {
    type: String,
    required: true,
  },
  street: {
    type: String,
    required: true,
  },
  postCode: {
    type: String,
    required: true,
  },
  houseNumber: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  manager: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  deposit: {
    type: Number,
    required: false,
  },
  serviceCancelDate: {
    type: Date,
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: false,
  },
  updatedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: false,
  },
  specialists: [{ type: Schema.Types.ObjectId, ref: 'User' }],
}, {
  timestamps: true,
});

export const Salon: Model<SalonModel> = model<SalonModel>('Salon', SalonSchema);
