import * as yup from 'yup';
import { greaterThanField } from '../../utils/yup';

const yupAdjusted = yup as any;

export const newSalonValidation = yup.object().shape({
    name: yupAdjusted
        .string()
        .max(100)
        .required(),
    city: yup
        .string()
        .max(50)
        .required(),
    street: yup
        .string()
        .max(80)
        .required(),
    email: yupAdjusted
        .string()
        .email()
        .max(80)
        .required(),
    phone: yup
        .string()
        .required(),
    postCode: yup
        .string()
        .required(),
    houseNumber: yup
        .string()
        .required(),
    manager: yup
        .string()
        .required(),
    deposit: yup
        .number()
        .required(),
    serviceCancelDate: yup
        .date(),
    lastEditBy: yup
        .date(),
});
