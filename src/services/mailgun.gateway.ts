import mailgunJs from 'mailgun-js';
import crypto from 'crypto';

export interface MessageType {
    from: string,
    to: string,
    cc: string,
    bcc: string,
    subject: string,
    html: string,
    'amp-html': string,
    text: string,
    attachment: any,
    inline: any,
    template: any,
    't:version': any,
    't:text': any,
    'o:tag': string,
    'o:dkim': 'yes' | 'no' | true | false,
    'o:deliverytime': string,
    'o:testmode': 'yes' | 'no',
    'o:tracking': boolean,
    'o:tracking-clicks': 'yes' | 'no' | true | false | 'htmlonly',
    'o:tracking-opens': 'yes' | 'no' | true | false,
    'o:require-tls': 'yes' | 'no' | 'True' | 'False',
    'o:skip-verification': 'yes' | 'no' | 'True' | 'False',
    'recipient-variables': any,
    [key: string]: any
}

class MailgunGateway {

    /**
     * Instanciate mailgun driver
     */
    mailgun() {
        return mailgunJs({
            apiKey: `${process.env.MAILGUN_API_KEY}`,
            domain: `${process.env.MAILGUN_DOMAIN}`
        });
    }

    /**
     * Sending email via mailgun api
     * 
     * @param data Email data
     * @param callback Lamgda function :(error, body) => { console.log(body); }
     */
    async sendMail(data: Partial<MessageType>, callback: any) {
        return this.mailgun().messages().send(data as any, callback)
    }

    /**
     * Validate mailgun webhook
     * @param webhookResponse webhook response
     */
    validateWebhook(webhookResponse: any) {
        const value = webhookResponse.timestamp + webhookResponse.token;
        const hash = crypto.createHmac('sha256', `${process.env.MAILGUN_API_KEY}`)
            .update(value)
            .digest('hex');
        return hash === webhookResponse.signature;
    }
}

export default new MailgunGateway() as MailgunGateway;