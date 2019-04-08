import {Document, model, Model, Schema} from 'mongoose';

export interface ServiceModel extends Document {
    name?: string;
    description?: string;
    performTime?: string;
    afterTime?: string;
    beforeTime?: string;
    priceDescription?: string;
    price?: string;
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
    performTime: {
        type: String,
        required: true,
    },
    afterTime: {
        type: String,
        required: true,
    },
    beforeTime: {
        type: String,
        required: true,
    },
    priceDescription: {
        type: Date,
        required: true,
    },
    price: {
        type: String,
        required: true,
    },
}, {
    timestamps: true,
});

export const Service: Model<ServiceModel> = model<ServiceModel>('Service', ServiceSchema);
