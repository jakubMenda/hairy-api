import jwt from 'jsonwebtoken';
import _ from 'lodash';
import { User } from '../../services/db/users/model';

export const getRequestingUser = async (token: string) => {
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  return await User.findById({ _id: _.get(decoded, '_id') });
};
