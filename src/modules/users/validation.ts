import * as yup from 'yup';
import { greaterThanField } from '../../utils/yup';

yup.addMethod(yup.number, 'greaterThanField', greaterThanField);
const yupAdjusted = yup as any;

// Tohle je hlavní validace všeho příchozího. Mongoose totiž především zabrání vložení do db, ale
// my chceme ještě předtím vlastní detailnější validaci - tady jde udělat úplně všechno dost jednoduše
export const newUserValidation = yup.object().shape({
  firstName: yupAdjusted
    .string()
    .max(80)
    .required(),
  lastName: yup
    .string()
    .max(80)
    .required(),
  email: yupAdjusted
    .string()
    .email()
    .max(80)
    .required(),
  password: yupAdjusted
    .string()
    .min(5)
    .max(80)
    .required(),
  isSpecialist: yupAdjusted
    .boolean()
    .required(),
});

export const newSpecialistValidation = yup.object().shape({
  firstName: yupAdjusted
    .string()
    .max(80)
    .required(),
  lastName: yup
    .string()
    .max(80)
    .required(),
  email: yupAdjusted
    .string()
    .email()
    .max(80)
    .required(),
  password: yupAdjusted
    .string()
    .min(5)
    .max(80),
  practiceFrom: yupAdjusted
    .date()
    .required(),
  specializations: yupAdjusted
    .array()
    .of(yup.string())
    .required(),
  workingFromMinutes: yupAdjusted
    .number()
    .min(0)
    .max(1439)
    .required(),
  workingToMinutes: yupAdjusted
    .number()
    .min(0)
    .max(1439)
    .greaterThanField(yupAdjusted.ref('workingFromMinutes'), 'workingToMinutes must be greater than workingFromMinutes')
    .required(),
  workingDays: yupAdjusted
    .array()
    .of(
      yupAdjusted
        .number()
        .min(0)
        .max(6)
    )
    .required(),
  workingAtSalonId: yupAdjusted
    .string()
    .required(),
  isSpecialist: yupAdjusted
    .boolean()
    .required(),
  services: yupAdjusted
    .array()
    .of(yup.string()),
});

export const signInValidation = yup.object().shape({
  email: yup
    .string()
    .email()
    .max(80)
    .required(),
  password: yup
    .string()
    .min(5)
    .max(80)
    .required(),
});

export const resetPasswordValidation = yup.object().shape({
  email: yup
    .string()
    .email()
    .max(80)
    .required(),
});

export const specialistsQueryValidation = yup.object().shape({
  serviceId: yup
    .string()
    .required(),
});

export const specialistsTimetableParamsValidation = yup.object().shape({
  specialistId: yup
    .string()
    .required(),
});
