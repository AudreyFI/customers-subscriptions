import { EmailParam } from './email-param'

export const lateExpired = (content: EmailParam) => {
  return {
    subject: `Ton abonnement ${process.env.APP_NAME} a expiré`,
    html: `<h3>Bonjour ${content.firstname} ${content.lastname}</h3>
      <p>Ton abonnement ${process.env.APP_NAME} a expiré</p>
      <p>Bonne route !</p>`,
  }
}
