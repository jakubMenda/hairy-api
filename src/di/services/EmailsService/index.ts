import emails from '../../../services/emails';

export const EmailsService = new emails(
  process.env.SENDGRID_API_KEY,
  process.env.PROVIDER_MAIL,
  process.env.APP_URL,
);
