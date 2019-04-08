import {Salon} from './model';
import {ObjectID} from 'bson';

export default class SalonManager {
  public async getSalonByUserId(userId: string) {
    const salon = await Salon.findOne({ manager: userId })
      .populate('manager', '-password')
      .populate('specialists', '-password')
      .populate('createdBy', '-password')
      .populate('updatedBy', '-password');

    if (!salon) {
      await Salon.findOne({ specialists: userId })
        .populate('manager', '-password')
        .populate('specialists', '-password')
        .populate('createdBy', '-password')
        .populate('updatedBy', '-password');
    }

    return salon;
  }

  public async createSalon(data: object, managerId: string) {
    const dataEnhanced = {
      ...data,
      createdBy: managerId,
      manager: new ObjectID(managerId),
    };

    const newSalon = new Salon(dataEnhanced);

    return await newSalon.save();
  }

  public async updateSalon(id: string, data: object) {
    const updated = await Salon.findByIdAndUpdate(id, data);

    return updated;
  }
}
