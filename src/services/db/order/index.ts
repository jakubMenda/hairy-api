import { Order, OrderStatus } from './model';
import {UserModel} from '../users/model';
import { asyncForEach } from '../../../utils/async';

export default class OrderManager {
    public async getOrdersByUser(userId: string) {
        return await Order.find({specialist: userId})
          .populate('specialist', '-password')
          .populate('changedBy', '-password')
          .populate('service');
    }

    public async getOrder(orderId: string) {
        return await Order.findById(orderId);
    }

    public async createOrder(data: object, userId?: string) {
        const dataEnhanced: any = { ...data };

        dataEnhanced.orderStatus = OrderStatus.NEW;

        if (userId) {
            dataEnhanced.changedBy = userId;
        }

        return await new Order(dataEnhanced).save();
    }

    public async deleteOrder(orderId: string) {
        return await Order.findByIdAndDelete(orderId);
    }

    public async updateOrder(orderId: string, data: object, userId: string) {
        const dataEnhanced: any = { ...data };

        dataEnhanced.orderStatus = OrderStatus.MODIFIED;
        dataEnhanced.changedBy = userId;

        return await Order.findByIdAndUpdate(orderId, dataEnhanced);
    }

    public async getOrdersBySalon(specialists: Array<string | UserModel>) {
        let orders: any[] = [];

        await asyncForEach(specialists, async (specialist: string | UserModel) => {
            const ordersOfSpecialist = await Order.find({specialist: specialist})
              .populate('specialist', '-password')
              .populate('changedBy', '-password')
              .populate('service');

            orders = orders.concat(ordersOfSpecialist);
        });

        return orders;
    }
}
