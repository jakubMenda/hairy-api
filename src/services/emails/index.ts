import sgMail from '@sendgrid/mail';
import changePassword from '../../emailTemplates/changePassword';
import welcomeAboard from '../../emailTemplates/welcomeAboard';
import specialistWelcomeAboard from '../../emailTemplates/specialistWelcomeAboard';

export default class EmailsService {
  private providerMail: string;
  private appUrl: string;

  constructor(apiKey: string, providerMail: string, appUrl: string) {
    sgMail.setApiKey(apiKey);
    this.providerMail = providerMail;
    this.appUrl = appUrl;
  }

  public async sendResetPasswordMail(email: string, password: string) {
    const logoUrl = `${this.appUrl}/images/logo.png`;
    const mailContent = changePassword(password, this.providerMail, logoUrl);
    const mailSettings = {
      to: email,
      from: this.providerMail,
      subject: 'Hair studio: obnovení hesla',
      html: mailContent,
    };
    await sgMail.send(mailSettings);
  }

  public async sendWelcomeAboardMail(email: string) {
    const logoUrl = `${this.appUrl}/images/logo.png`;
    const mailContent = welcomeAboard(this.providerMail, logoUrl);
    const mailSettings = {
      to: email,
      from: this.providerMail,
      subject: 'Hair studio: vítejte na palubě!',
      html: mailContent,
    };
    await sgMail.send(mailSettings);
  }

  public async sendSpecialistWelcomeAboardMail(email: string, password: string) {
    const logoUrl = `${this.appUrl}/images/logo.png`;
    const mailContent = specialistWelcomeAboard(password, this.providerMail, logoUrl);
    const mailSettings = {
      to: email,
      from: this.providerMail,
      subject: 'Hair studio: vítejte na palubě!',
      html: mailContent,
    };
    await sgMail.send(mailSettings);
  }
}
