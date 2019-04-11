import * as yup from 'yup';

export const orderValidation = yup.object().shape({
    phone: yup
        .string()
        .max(20)
        .required(),
    email: yup
        .string()
        .required()
        .email()
        .max(80),
    noteCustomer: yup
        .string()
        .max(1000),
    noteAdmin: yup
        .string()
        .max(1000),
    notificationType: yup
        .string(),
    notificationTime: yup
        .date(),
    firstName: yup
        .string()
        .required(),
    lastName: yup
        .string()
        .required(),
    specialist: yup
        .string()
        .required(),
    service: yup
        .string()
        .required(),
    date: yup
      .date()
      .required(),
});

export const updateOrderValidation = yup.object().shape({
    phone: yup
        .string()
        .max(20),
    noteCustomer: yup
        .string()
        .max(1000),
    noteAdmin: yup
        .string()
        .max(1000),
    notificationType: yup
        .string(),
    notificationTime: yup
        .date(),
    firstName: yup
        .string(),
    lastName: yup
        .string(),
    specialist: yup
        .string(),
    service: yup
        .string(),
});
