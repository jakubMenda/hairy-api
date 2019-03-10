import Users from './users';

export default class DBManager {
  public UsersService: Users;

  constructor() {
    // Služby volající dotazy do db rozdělené dle db kolekcí
    this.UsersService = new Users();
  }
}
