import * as yup from 'yup';
import { greaterThanField, notGreaterThanField } from '../../utils/yup';

yup.addMethod(yup.number, 'notGreaterThanField', notGreaterThanField);
yup.addMethod(yup.number, 'greaterThanField', greaterThanField);
const yupAdjusted = yup as any;

export const newServiceValidation = yup.object().shape({
  name: yupAdjusted
    .string()
    .max(100)
    .required(),
  description: yupAdjusted
    .string()
    .max(300)
    .required(),
  duration: yupAdjusted
    .number()
    .required(),
  timeWindows: yup.array().of(yup.object().shape({
    start: yupAdjusted.number().notGreaterThanField(yupAdjusted.ref('end'), 'start of time window cant be before the end').required(),
    end: yupAdjusted.number().required(),
  })),
  price: yupAdjusted
    .number()
    .required(),
  priceDescription: yupAdjusted
    .string()
    .max(300)
    .required(),
  category: yupAdjusted
    .array()
    .of(yup.string())
    .required(),
  hairType: yupAdjusted
    .array()
    .of(yupAdjusted.string())
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

export const serviceGetValidation = yup.object().shape({
  hairType: yup
    .string()
    .required(),
  category: yup
    .string()
    .required(),
});
