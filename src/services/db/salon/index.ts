import {Salon} from './model';
import {ObjectID} from 'bson';

export default class SalonManager {
  public async getSalonByUserId(userId: string) {
    let salon = await Salon.findOne({ manager: userId })
      .populate('manager', '-password')
      .populate('specialists', '-password')
      .populate('createdBy', '-password')
      .populate('updatedBy', '-password');

    if (!salon) {
      salon =  await Salon.findOne({ specialists: userId })
        .populate('manager', '-password')
        .populate('specialists', '-password')
        .populate('createdBy', '-password')
        .populate('updatedBy', '-password');
    }

    return salon;
  }

  public async getSalonById(salonId: string) {
    try {
      return await Salon.findById(salonId);
    } catch(e) {
      return null;
    }
  }

  public async createSalon(data: object, managerId: string, isSpecialist?: boolean) {
    const dataEnhanced: any = {
      ...data,
      createdBy: managerId,
      manager: new ObjectID(managerId),
    };

    if (isSpecialist) {
      dataEnhanced.specialists = [managerId];
    }

    const newSalon = new Salon(dataEnhanced);

    return await newSalon.save();
  }

  public async updateSalon(id: string, data: object) {
    const updated = await Salon.findByIdAndUpdate(id, data);

    return updated;
  }
}
