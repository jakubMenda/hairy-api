import _ from 'lodash';
import moment from 'moment';
import sgMail from '@sendgrid/mail';
import changePassword from '../../emailTemplates/changePassword';
import welcomeAboard from '../../emailTemplates/welcomeAboard';
import specialistWelcomeAboard from '../../emailTemplates/specialistWelcomeAboard';
import newOrderCustomer from '../../emailTemplates/newOrderCustomer';
import newOrderSpecialist from '../../emailTemplates/newOrderSpecialist';
import orderDeletion from '../../emailTemplates/orderDeletion';
import orderDeletionSpecialist from '../../emailTemplates/orderDeletionSpecialist';

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

  public async sendNewOrderSpecialistEmail(email: string, data: object) {
    const logoUrl = `${this.appUrl}/images/logo.png`;
    const mailContent = newOrderSpecialist(
      _.get(data, 'firstName'),
      _.get(data, 'lastName'),
      _.get(data, 'email'),
      _.get(data, 'phone'),
      moment(_.get(data, 'date')).add(2, 'hours').format('DD.MM. HH:mm'),
      this.providerMail,
      logoUrl
    );

    const mailSettings = {
      to: email,
      from: this.providerMail,
      subject: 'Hair studio: nová objednávka!',
      html: mailContent,
    };
    await sgMail.send(mailSettings);
  }

  public async sendNewOrderCustomerEmail(data: object, cancellationLink: string) {
    const logoUrl = `${this.appUrl}/images/logo.png`;
    const mailContent = newOrderCustomer(
      _.get(data, 'firstName'),
      _.get(data, 'lastName'),
      moment(_.get(data, 'date')).add(2, 'hours').format('DD.MM. HH:mm'),
      this.providerMail,
      logoUrl,
      cancellationLink,
    );

    const mailSettings = {
      to: _.get(data, 'email'),
      from: this.providerMail,
      subject: 'Hair studio: nová objednávka!',
      html: mailContent,
    };
    await sgMail.send(mailSettings);
  }

  public async sendOrderDeletionEmail(date: string | Date, customerEmail: string) {
    const logoUrl = `${this.appUrl}/images/logo.png`;
    const mailContent = orderDeletion(
      moment(date).add(2, 'hours').format('DD.MM. HH:mm'),
      this.providerMail,
      logoUrl
    );

    const mailSettings = {
      to: customerEmail,
      from: this.providerMail,
      subject: 'Hair studio: Vaše objednávka byla zrušena',
      html: mailContent,
    };
    await sgMail.send(mailSettings);
  }

  public async sendOrderDeletionSpecialistEmail(date: string | Date, specialistEmail: string, firstName: string, lastName: string) {
    const logoUrl = `${this.appUrl}/images/logo.png`;
    const mailContent = orderDeletionSpecialist(
      moment(date).add(2, 'hours').format('DD.MM. HH:mm'),
      this.providerMail,
      logoUrl,
      firstName,
      lastName
    );

    const mailSettings = {
      to: specialistEmail,
      from: this.providerMail,
      subject: 'Hair studio: Objednávka zrušena',
      html: mailContent,
    };
    await sgMail.send(mailSettings);
  }
}
