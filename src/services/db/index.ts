import Users from './users';
import Category from './category';

export default class DBManager {
    public UsersService: Users;
    public CategoryService: Category;

    constructor() {
        // Služby volající dotazy do db rozdělené dle db kolekcí
        this.UsersService = new Users();
        this.CategoryService = new Category();
    }
}
