export type EmailTemplate = {
  subject: string
  html: string
}

export interface EmailLibrary {
  sendEmail(content: { email: string; template: EmailTemplate }): void
}
