const nodemailer = require('nodemailer');
// const sparkPostTransporter = require('nodemailer-sparkpost-transport') 
const path = require('path');
const pug = require('pug');
require('dotenv').config()


class email {

    from
    transporter

    constructor(){
        this.from = "Messange <noReply@messange.com>"

        if(process.env.NODE_ENV === 'production'){
            this.transporter = nodemailer.createTransport(
                sparkPostTransporter({                
                    sparkPostApiKey: '',                                                
                    endPoint: "https://api.eu.sparkpost.com"
                })
            );
        }
        else{
            this.transporter = nodemailer.createTransport({     //configure a mail tester for dev version, to not degrade our reputation 
                host: "sandbox.smtp.mailtrap.io",
                port: process.env.NODEMAILER_PORT,
                auth: {
                  user: process.env.NODEMAILER_USER,
                  pass: process.env.NODEMAILER_PASSWORD
                }
            });
        }
    }

    async sendResetPasswordLink(options){
        try {
            const email = {
                from: this.from,
                subject: 'Réinitialisation de votre mot de passe',
                to: options.to,
                html: pug.renderFile(path.join(__dirname, 'templates/passwordResetTemplate.pug'), {
                    url: `${options.url}/user/reset-password/${options.userId}/${options.token}/${options.serverToken}`,
                    mail: options.to
                }),
                attachments: [{
                    filename: 'logo.png',
                    path: path.join(__dirname, '../../public/assets/logoMessange320.png'),
                    cid: "unique@cid.ee"
                }]
            };
            const response = await this.transporter.sendMail(email);
            console.log(response)
        } catch (error) {
            throw error
        }
    }
}

module.exports = new email();