import * as yup from 'yup';
import {greaterThanField} from '../../utils/yup';

const yupAdjusted = yup as any;

export const orderValidation = yup.object().shape({
    phone: yupAdjusted
        .string()
        .max(20),
    email: yupAdjusted
        .string()
        .email()
        .max(80),
    noteCustomer: yupAdjusted
        .string()
        .max(1000),
    noteAdmin: yupAdjusted
        .string()
        .max(1000),
    notificationType: yupAdjusted
        .string()
        .required(),
    notificationTime: yup
        .date()
        .required(),
    firstName: yup
        .string()
        .required(),
    lastName: yup
        .string()
        .required(),
    lastChange: yup
        .date(),
    changedBy: yup
        .string(),
    specialist: yup
        .string(),
    orderStatus: yup
        .string(),
    services: yup
        .array()
        .of(yup.string()),
});

export const updateOrderValidation = yup.object().shape({
    phone: yupAdjusted
        .string()
        .max(20),
    email: yupAdjusted
        .string()
        .email()
        .max(80),
    noteCustomer: yupAdjusted
        .string()
        .max(1000),
    noteAdmin: yupAdjusted
        .string()
        .max(1000),
    notificationType: yupAdjusted
        .string()
        .required(),
    notificationTime: yup
        .date()
        .required(),
    firstName: yup
        .string()
        .required(),
    lastName: yup
        .string()
        .required(),
    lastChange: yup
        .date(),
    changedBy: yup
        .string(),
    specialist: yup
        .string(),
    orderStatus: yup
        .string(),
    services: yup
        .array()
        .of(yup.string()),
});
