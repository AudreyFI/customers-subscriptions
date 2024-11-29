import nodemailer from 'nodemailer'
import Mail from 'nodemailer/lib/mailer'
import { Service } from 'typedi'
import { EmailLibrary, EmailTemplate } from './email-library.interface'

@Service()
export class NodemailerLibrary implements EmailLibrary {
  readonly from = process.env.EMAIL_SENDER
  private transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: 587,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  })

  sendEmail(content: { email: string; template: EmailTemplate }) {
    const emailOptions: Mail.Options = {
      from: this.from,
      to: content.email,
      subject: content.template.subject,
      html: content.template.html,
      cc: process.env.EMAIL_CC,
    }
    this.transporter.sendMail(emailOptions, (error, info) => {
      if (error) {
        console.log('Error:' + error)
      } else {
        console.log('Email sent: ' + info.response)
      }
    })
  }
}
