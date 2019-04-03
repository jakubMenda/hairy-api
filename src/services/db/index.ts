import Users from './users';
import Category from './category';
import HairType from './hairType';

export default class DBManager {
    public UsersService: Users;
    public CategoryService: Category;
    public HairTypeService: HairType;

    constructor() {
        this.UsersService = new Users();
        this.CategoryService = new Category();
        this.HairTypeService = new HairType();
    }
}
