import {Category, CategoryModel} from './model';

export default class CategoryManager {
    private async getAllCategories() {
        return await Category.find();
    }

    public async getCategories() {
        const categories = await this.getAllCategories();
        return categories;
    }

}
