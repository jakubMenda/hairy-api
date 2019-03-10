import * as yup from 'yup';

// Tohle je hlavní validace všeho příchozího. Mongoose totiž především zabrání vložení do db, ale
// my chceme ještě předtím vlastní detailnější validaci - tady jde udělat úplně všechno dost jednoduše
export const newUserValidation = yup.object(). shape({
  firstName: yup
    .string()
    .max(80)
    .required(),
  lastName: yup
    .string()
    .max(80)
    .required(),
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

export const signInValidation = yup.object(). shape({
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
