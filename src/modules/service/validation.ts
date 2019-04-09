import * as yup from 'yup';

export const newServiceValidation = yup.object().shape({
    name: yup
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
    timeWindows: yup.array().of(yup.object().shape({
            start: yup.number().required(),
            end: yup.number().required(),
        })),
    price: yup
        .number()
        .required(),
    priceDescription: yup
        .string()
        .max(300)
        .required(),
    category: yup
        .array()
        .of(yup.string())
        .required(),
    hairType: yup
        .array()
        .of(yup.string())
        .required(),
});

export const updateServiceValidation = yup.object().shape({
    name: yup
        .string()
        .max(100),
    description: yup
        .string()
        .max(300),
    duration: yup
        .number(),
    timeWindows: yup.array().of(yup.object().shape({
            start: yup.number().required(),
            end: yup.number().required(),
        })),
    price: yup
        .number(),
    priceDescription: yup
        .string()
        .max(300),
    category: yup
        .array()
        .of(yup.string()),
    hairType: yup
        .array()
        .of(yup.string()),
});
