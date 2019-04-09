import {Service} from './model';

export default class ServiceManager {
  public async findServiceById(id: string) {
    return await Service.findById(id);
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
}
