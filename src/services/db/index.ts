import Users from './users';
import Category from './category';
import Salon from './salon';
import HairType from './hairType';
import Order from './order';

export default class DBManager {
    public UsersService: Users;
    public CategoryService: Category;
    public SalonService: Salon;
    public HairTypeService: HairType;
    public OrderService: Order;

    constructor() {
        this.UsersService = new Users();
        this.CategoryService = new Category();
        this.SalonService = new Salon();
        this.HairTypeService = new HairType();
        this.OrderService = new Order();
    }
}
