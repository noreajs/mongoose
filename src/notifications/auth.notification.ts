import { ClientSession } from "mongoose"
import User from "../models/User"
import onesignalGateway from "../services/onesignal.gateway"

export const sendSecretCodeViaPush = async (userId: string, secretCode: string, session?: ClientSession): Promise<void> => {

    const user = session ? await User.findById(userId).session(session) : await User.findById(userId)

    if (user && user.oneSignalUserId) {
        // send notification
        await onesignalGateway.sendNotification({
            include_player_ids: [user.oneSignalUserId],
            headings: {
                en: `New secret code`,
                fr: `Nouveau code secret`
            },
            contents: {
                en: `Your new secret code is ${secretCode}. Please change it as soon as possible.`,
                fr: `Votre nouveau code secret est ${secretCode}. Veuillez le changer dès que possible.`
            }
        }).catch((error) => { console.log('failed to send notification', error) })
    }
}

class AuthNotification {

    push: {
        sendSecretCode: (userId: string, secretCode: string, session?: ClientSession) => Promise<void>
    }

    constructor() {

        this.push = {
            sendSecretCode: sendSecretCodeViaPush
        }
    }
}

export default new AuthNotification()