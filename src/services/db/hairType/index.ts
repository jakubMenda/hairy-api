import { HairType } from './model';

export default class HairTypeManager {
    public async getTypes() {
        return await HairType.find();
    }
}
