const nodemailer = require('nodemailer');
const pug = require('pug');
const htmlToText = require('html-to-text');
const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.name.split(' ')[0];
    this.url = url;
    this.from = `Natours: <${process.env.EMAIL_FROM}>`;
  }

  newTransport() {
    return nodemailer.createTransport({
      service: 'SendGrid',
      auth: {
        user: process.env.SENDGRID_USERNAME,
        pass: process.env.SENDGRID_PASSWORD
      },
      secure: false,
      tls: {
        rejectUnauthorized: false
      }
    });
  }

  // Send the actual email
  async send(template, subject) {
    //1) Render HTML based on a pug template.
    const html = pug.renderFile(
      `${__dirname}/../views/emails/${template}.pug`,
      {
        firstName: this.firstName,
        url: this.url,
        subject
      }
    );

    //2) Define email options.
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text: htmlToText.convert(html)
    };

    //3) Create a transport and send email.
    // await this.newTransport().sendEmail(mailOptions);
    await sgMail.send(mailOptions); //using send grid.
  }

  async sendWelcome() {
    await this.send(`Welcome`, 'Welcome to the Natours Family.');
  }

  async sendResetPassword() {
    await this.send(
      `passwordReset`,
      'Your password reset token (valid for only 10 minutes).'
    );
  }
};
