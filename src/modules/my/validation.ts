import * as yup from 'yup';

export const orderValidation = yup.object().shape({
    phone: yup
        .string()
        .max(20),
    email: yup
        .string()
        .email()
        .max(80),
    noteCustomer: yup
        .string()
        .max(1000),
    noteAdmin: yup
        .string()
        .max(1000),
    notificationType: yup
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
    phone: yup
        .string()
        .max(20),
    email: yup
        .string()
        .email()
        .max(80),
    noteCustomer: yup
        .string()
        .max(1000),
    noteAdmin: yup
        .string()
        .max(1000),
    notificationType: yup
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
