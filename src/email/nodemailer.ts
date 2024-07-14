import nodemailer from 'nodemailer'
import { EmailLibrary, EmailTemplate } from './email-library.interface'
import { Service } from 'typedi'

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
    const emailOptions = {
      from: this.from,
      to: content.email,
      subject: content.template.subject,
      html: content.template.html,
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
