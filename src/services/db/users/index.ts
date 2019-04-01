import bcrypt from 'bcryptjs';
import {User} from './model';
import {HttpError} from '../../../utils/errorHandling/errors';
import {FORBIDDEN} from 'http-codes';

export default class UsersManager {
  public async getUserByEmail(email: string) {
    return await User.findOne({ email });
  }

  public async getUserByCredentials(email: string, pass: string) {
    // Vytáhnu usera z db
    const user = await this.getUserByEmail(email);

    // Pokud tam není, mám špatný mail
    if (!user) {
      throw new HttpError({
        statusCode: FORBIDDEN,
        message: 'Wrong email or password',
      });
    }

    // Je v DB -> porovnám heslo
    const passwordMatches = await bcrypt.compare(pass, user.password);

    // Nesedí - vyhodím 403 (o tu se stejně jako vždy postará errorHandler
    if (!passwordMatches) {
      throw new HttpError({
        statusCode: FORBIDDEN,
        message: 'Wrong email or password',
      });
    }

    return user;
  }

  public async saveUser(userData: any) {
    // vytvoření mongoose instance Usera včetně validace a transformací
    const user = new User(userData);

    // vše prošlo > uložení do db
    const savedUser = await user.save();

    // vracím výsledek uložený do db (bez hesla)
    return savedUser;
  }
}
