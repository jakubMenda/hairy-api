import { NextFunction, Request, Response, Router } from 'express';
import _ from 'lodash';
import { DBService } from '../../di';
import { CONFLICT, OK, CREATED } from 'http-codes';
import { HttpError } from '../../utils/errorHandling/errors';
import { newUserValidation, signInValidation } from './validation';

const usersController = Router();

usersController.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Čapnu si tělo requestu
    const userData = _.get(req, 'body');

    // yup validace
    await newUserValidation.validate(userData);

    // nejdřív kontrola, jestli už není email v db
    const existingUser = await DBService.UsersService.getUserByEmail(_.get(userData, 'email', ''));
    if (existingUser) {
      // pokud user už existuje, zavolám fn next, která zabrání provádění dalšího kódu a předá handling dalšímu middlewaru.
      // pokud předám v next jako parametr error (vytvářím nový http error), bude ho handlovat až errorHandler (jediný
      // midleware, který má na vstupu i error)
      next(
        new HttpError({
          statusCode: CONFLICT,
          message: `Email (${_.get(userData, 'email', '')}) is already in use`,
        })
      );
    } else {
      // uložení nového uživatele
      const savedUser = await DBService.UsersService.saveUser(userData);

      // Naformátování modelu do objektu a vytáhnutí hesla - nechci ho posílat zpět
      const profile = await savedUser.getPublicProfile();

      // odpověď klientovi
      res.status(CREATED).json(profile);
    }
  } catch (e) {
    // podobně jako výše. V případě, že nastane jakákoli chyba, jen jí předám dál a stará se o ní error handler
    return next(e);
  }
});

usersController.post('/sign-in', async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Bezpečné vytáhnutí body requestu
    const reqBody = _.get(req, 'body');

    // yup validace
    await signInValidation.validate(reqBody);

    // metoda níže vytáhne usera z db a porovná heslo. V případě, že souhlasí, vrátí usera. Jinak vyhodí http error (403).
    const userModel = await DBService.UsersService.getUserByCredentials(
      _.get(reqBody, 'email'),
      _.get(reqBody, 'password')
    );

    // User je ověřen -> vytvořím jwt token
    const token = await userModel.generateAuthToken();

    // Vytáhnu z dat uživatele heslo - nechci ho posílat po síti
    const profile = await userModel.getPublicProfile();

    // pošlu zpět klientovi
    res.status(OK).json({
      token,
      user: profile,
    });
  } catch(e) {
    return next(e);
  }
});

export default usersController;
