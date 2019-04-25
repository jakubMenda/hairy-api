import { Holiday, HolidayModel } from './model';
import { Types } from 'mongoose';

export default class HolidayManager {
  public async getHolidayByUser(userId: string) {
    return await Holiday.find({ specialist: Types.ObjectId(userId) });
  }

  public async createHoliday(userId: string, data: HolidayModel) {
    const dataWithSpecialist = { ...data, specialist: userId };

    return await new Holiday(dataWithSpecialist).save();
  }

  public async deleteHoliday(userId: string, holidayId: string) {
    return await Holiday.findOneAndDelete({ _id: holidayId, specialist: userId });
  }

  public async updateHoliday(userId: string, holidayId: string, data: object) {
    return await Holiday.findOneAndUpdate({ _id: holidayId, specialist: userId}, data);
  }
}
