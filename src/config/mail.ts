import * as nodemailer from 'nodemailer';

export default function mailConfigs (
    user_email: string, 
    user_first_name: string, 
    user_last_name: string
  ) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'web.apptest@outlook.com',
      pass: 'monkeysAreFunny0205'
    }
  });
  
  const mailOptions = {
    from: 'web.apptest@outlook.com',
    to: 'rafa.costa0@hotmail.com',
    subject: 'Sending e-mail using nodejs and nodemailer',
    text: 'Wow it worked!!!'
  };
  
  transporter.sendMail(mailOptions, function(error, info) {
    if(error) {
      console.log(error);
    } else {
      console.log('Email sent:' + info.response);
    }
  });
}