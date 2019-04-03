import {Document, model, Model, Schema} from 'mongoose';
import {UserModel} from '../users/model';

export interface SalonModel extends Document {
    name?: string;
    city?: string;
    street?: string;
    postCode?: string;
    houseNumber?: string;
    phone?: string;
    manager?: UserModel;
    deposit?: number;
    serviceCancelDate?: Date;
    lastEditBy?: UserModel;
    lastEdit?: Date;
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
        type: Schema.Types.ObjectId, ref: 'User',
        required: true,
    },
    deposit: {
        type: Number,
        required: false,
    },
    serviceCancelDate: {
        type: Date,
        required: true,
    },
    lastEditBy: {
        type: Schema.Types.ObjectId, ref: 'User',
        required: false,
    },
    lastEdit: {
        type: Date,
        required: false,
    },
});

export const Salon: Model<SalonModel> = model<SalonModel>('Salon', SalonSchema);
