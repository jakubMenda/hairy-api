import { HairType } from './model';

export default class HairTypeManager {
  public async getTypes() {
    return await HairType.find();
  }

  public async getHairTypeById(hairTypeId: string) {
    try {
      return await HairType.findById(hairTypeId);
    } catch (e) {
      return null;
    }
  }
}
