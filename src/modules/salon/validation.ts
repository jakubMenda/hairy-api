import * as yup from 'yup';

const yupAdjusted = yup as any;

export const salonValidation = yup.object().shape({
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
    deposit: yup
        .number(),
    serviceCancelDate: yup
        .date(),
    specialists: yup
        .array()
        .of(yup.string()),
});

export const updateSalonValidation = yup.object().shape({
  name: yupAdjusted
    .string()
    .max(100),
  city: yup
    .string()
    .max(50),
  street: yup
    .string()
    .max(80),
  email: yupAdjusted
    .string()
    .email()
    .max(80),
  phone: yup
    .string(),
  postCode: yup
    .string()
    .required(),
  houseNumber: yup
    .string(),
  deposit: yup
    .number(),
  serviceCancelDate: yup
    .date(),
  specialists: yup
    .array()
    .of(yup.string()),
});
