import Users from './users';
import Category from './category';

export default class DBManager {
    public UsersService: Users;
    public CategoryService: Category;

    constructor() {
        this.UsersService = new Users();
        this.CategoryService = new Category();
    }
}
