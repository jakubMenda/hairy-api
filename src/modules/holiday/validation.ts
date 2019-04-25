import * as yup from 'yup';

export const holidayValidation = yup.object().shape({
    from: yup
      .date()
      .required(),
    to: yup
      .date()
      .required(),
});
