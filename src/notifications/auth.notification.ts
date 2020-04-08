import { ClientSession } from "mongoose"

class AuthNotification {

    email: {
        sendNewPassword: (userId: string, password: string, session?: ClientSession) => Promise<void>
    }

    constructor() {

        this.email = {
            sendNewPassword: async (userId: string, password: string) => { }
        }
    }
}

export default new AuthNotification()