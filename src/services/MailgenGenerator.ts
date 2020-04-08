import Mailgen = require("mailgen");

class MailgenGenerator {
    private mailgen: Mailgen;

    /**
     * Colors
     */
    colors = {
        primary: '#00B0FF',
        success: '#00BFA6',
        danger: '#F50057',
        warning: '#F9A826',
        secondary: '#535c68'
    }

    constructor() {
        this.mailgen = new Mailgen({
            theme: 'default',
            product: {
                // Appears in header & footer of e-mails
                name: 'Your app name',
                link: 'your app site link',
                // Optional product logo
                logo: 'you app logo link'
            }
        })
    }

    generateBody(params: Mailgen.Content): any {
        return this.mailgen.generate(params)
    }

    generatePlaintext(params: Mailgen.Content): any {
        return this.mailgen.generatePlaintext(params)
    }
}

export default new MailgenGenerator() as MailgenGenerator