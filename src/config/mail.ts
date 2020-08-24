import sgMail from '@sendgrid/mail';

export function sendGridMail(email: string){
  // using Twilio SendGrid's v3 Node.js Library
  // https://github.com/sendgrid/sendgrid-nodejs
  sgMail.setApiKey(String(process.env.SENDGRID_API_KEY));
  
  const msg = {
    to: email,
    from: 'web.apptest@outlook.com',
    subject: 'Recuperação de senha',
    html: '<h1>Opa, parece que você esqueceu sua senha!</h1>'
    +'<h2>Sem problema</h2><br/>'+
    '<p>Clicando no linke você será redirecionado para a página de recperação de senha -> </p>'+
    '<a href="https://vigilant-shirley-175a33.netlify.app//reset-password">'+
    'Resete sua senha</a>',
  };
  sgMail.send(msg).then(() => {
    
  }).catch((error) => {
      console.log(error.response.body)
      // console.log(error.response.body.errors[0].message)
  });
}