import {Service} from './model';

export default class ServiceManager {
  public async findServiceById(id: string) {
    try {
      return await Service.findById(id);
    } catch(e) {
      return null;
    }
  }

  public async updateService(id: string, data: object) {
    return await Service.findByIdAndUpdate(id, data);
  }

  public async createService(data: object) {
    return await (new Service(data)).save();
  }

  public async getServicesBySalonId(salonId: string) {
    return await Service.find({salon: salonId});
  }

  public async removeServiceById(serviceId: string) {
    return await Service.findByIdAndRemove(serviceId);
  }

  public async getServicesByFilters(salonId: string, hairType: string, category: string) {
    try {
      return await Service.find({
        salon: salonId,
        hairType: hairType,
        category: category,
      });
    } catch(e) {
      return null;
    }
  }
}
