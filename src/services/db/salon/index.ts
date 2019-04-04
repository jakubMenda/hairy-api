import {Salon} from './model';
import {HttpError} from '../../../utils/errorHandling/errors';
import {UNAUTHORIZED} from 'http-codes';

export default class SalonManager {
    public async getSalonByUserId(userId: string) {
        // Chci najít salon, kde je uživatel manažer
        let salon = await Salon.findOne({ manager: userId });
        // Pokud neni manažer, může být specialista v daném salónu
        // Snažil jsem se naplnit specialisty salónu a v nich najít usera
        // Kdyby bylo víc salonu, tak nebude findOne
        // V tomto přístupu se musí do salonu "pushovat" specialisté (asi takto Salon.specialists.push(user))
        // _
        // Šolich možnost:
        // Pokud je to blbost, tak jelikož máme jeden salón,
        // tak se můžem podívat jestli je specialista a v tom případě prostě salon vrátit
        salon = salon ? salon : await Salon.findOne().populate({
            path: 'specialists',
            match: {
                _id: userId,
            },
        }).exec();
        if (!salon) {
            throw new HttpError({
                statusCode: UNAUTHORIZED,
                message: 'User has no salon',
            });
        }
        return salon;
    }
}
