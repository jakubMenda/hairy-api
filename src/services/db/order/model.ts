import {Document, model, Model, Schema} from 'mongoose';
import {UserModel} from '../users/model';
import {ServiceModel} from '../service/model';

export enum OrderStatus {
    NEW = 'new',
    MODIFIED = 'modified',
}

export interface OrderModel extends Document {
    phone?: string;
    email?: string;
    noteCustomer?: string;
    noteAdmin?: string;
    notificationType?: string;
    notificationTime?: Date;
    firstName?: string;
    lastName?: string;
    changedBy?: string | UserModel;
    specialist?: string | UserModel;
    orderStatus?: string;
    service?: string | ServiceModel;
    date: Date | string;
}

export const OrderSchema: Schema = new Schema({
    phone: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    noteCustomer: {
        type: String,
    },
    noteAdmin: {
        type: String,
    },
    notificationType: {
        type: String,
    },
    notificationTime: {
        type: Date,
    },
    firstName: {
        type: String,
        required: true,
    },
    lastName: {
        type: String,
        required: true,
    },
    changedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: false,
    },
    specialist: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    orderStatus: {
        type: String,
        required: true,
    },
    service: {
        type: Schema.Types.ObjectId,
        ref: 'Service',
    },
    date: {
        type: String,
        required: true,
    },
}, {
    timestamps: true,
});

export const Order: Model<OrderModel> = model<OrderModel>('Order', OrderSchema);
