import { EmailParam } from './email-param'

export const expired = (content: EmailParam) => {
  return {
    subject: `Ton abonnement ${process.env.APP_NAME} a expiré`,
    html: `<h3>Bonjour ${content.firstname} ${content.lastname}</h3>
      <p>Ton abonnement ${process.env.APP_NAME} expire aujourd'hui</p>
      <p>Si tu souhaites renouveler ta cotisation, merci de faire le virement sur le compte ${process.env.APP_NAME} dans la journée</p>
      <p>A bientôt !</p>`,
  }
}
