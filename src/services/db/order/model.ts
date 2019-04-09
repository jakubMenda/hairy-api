import {Document, model, Model, Schema} from 'mongoose';
import {UserModel} from '../users/model';
import {ServiceModel} from '../service/model';

export interface OrderModel extends Document {
    phone?: string;
    email?: string;
    noteCustomer?: string;
    noteAdmin?: string;
    notificationType?: string;
    notificationTime?: Date;
    firstName?: string;
    lastName?: string;
    lastChange?: Date;
    changedBy?: string | UserModel;
    specialist?: string | UserModel;
    orderStatus?: string;
    services?: Array<string | ServiceModel>;
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
        required: true,
    },
    noteAdmin: {
        type: String,
        required: true,
    },
    notificationType: {
        type: String,
        required: true,
    },
    notificationTime: {
        type: Date,
        required: true,
    },
    firstName: {
        type: String,
        required: true,
    },
    lastName: {
        type: String,
        required: true,
    },
    lastChange: {
        type: Date,
        createdAt: true,
        updatedAt: true,
        required: false,
    },
    changedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: false,
    },
    specialist: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: false,
    },
    orderStatus: {
        type: String,
        required: true,
    },
    services: [{type: Schema.Types.ObjectId, ref: 'Service'}],
}, {
    timestamps: true,
});

export const Order: Model<OrderModel> = model<OrderModel>('Order', OrderSchema);
