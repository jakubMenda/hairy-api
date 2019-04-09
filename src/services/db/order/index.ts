import {Order} from './model';
import {UserModel} from '../users/model';

export default class OrderManager {
    public async getOrdersByUser(userId: string) {
        return await Order.find({specialist: userId});
    }

    public async getOrder(orderId: string) {
        return await Order.findOne({_id: orderId});
    }

    public async createOrder(data: object, userId: string) {
        const dataEnhanced = {
            ...data,
            lastChange: new Date().toISOString(),
            changedBy: userId,
        };

        return await new Order(dataEnhanced).save();
    }

    public async deleteOrder(orderId: string) {
        return await Order.findOneAndDelete({_id: orderId});
    }

    public async updateOrder(orderId: string, data: object) {
        return await Order.findByIdAndUpdate(orderId, data);
    }

    public getOrdersBySalon(specialists: Array<string | UserModel>) {
        const orders: any[] = [];
        specialists.forEach((specialist) => {
            orders.push(Order.find({specialist:specialist}));
        });

        return orders;
    }
}
