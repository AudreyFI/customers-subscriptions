import { EmailParam } from './email-param'

export const soonToExpire = (content: EmailParam) => {
  return {
    subject: `Ton abonnement ${process.env.APP_NAME} arrive bientôt à expiration`,
    html: `<h3>Bonjour ${content.firstname} ${content.lastname}</h3>
    <p>Ton abonnement ${process.env.APP_NAME} arrive bientôt à expiration (le ${content.endDate}</p>
    <p>Si tu souhaites renouveler ta cotisation, merci de faire le virement sur le compte ${process.env.APP_NAME}</p>
    <p>A bientôt !</p>`,
  }
}
