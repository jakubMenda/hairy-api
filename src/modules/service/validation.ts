import * as yup from 'yup';

const yupAdjusted = yup as any;

export const newServiceValidation = yup.object().shape({
    name: yupAdjusted
        .string()
        .max(100)
        .required(),
    description: yup
        .string()
        .max(300)
        .required(),
    duration: yup
        .number()
        .required(),
    durationBefore: yup
        .number()
        .required(),
    durationAfter: yup
        .number()
        .required(),
    price: yup
        .number()
        .required(),
    priceDescription: yup
        .string()
        .max(300)
        .required(),
});

export const updateServiceValidation = yup.object().shape({
    name: yupAdjusted
        .string()
        .max(100),
    description: yup
        .string()
        .max(300),
    duration: yup
        .number(),
    durationBefore: yup
        .number(),
    durationAfter: yup
        .number(),
    price: yup
        .number(),
    priceDescription: yup
        .string()
        .max(300),
});
