import * as nodemailer from "nodemailer";
import config from './configs';

class Mail {

  constructor(
    public to?: string,
    public subject?: string,
    public message?: string) { }


  sendMail() {

    let mailOptions = {
      from: "rafa.costa0@hotmail.com",
      to: this.to,
      subject: this.subject,
      html: this.message
    };

    const transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: false,
      auth: {
        user: config.user,
        pass: config.password
      },
      tls: { rejectUnauthorized: false }
    });

    console.log(mailOptions);

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        return error;
      } else {
        return console.log("E-mail enviado com sucesso!");
      }
    });
  }
}

export default new Mail;