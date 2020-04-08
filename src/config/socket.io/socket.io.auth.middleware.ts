import socketIo from 'socket.io';
import jwt from 'jsonwebtoken';
import User from '../../models/User';
import { serializeError } from 'serialize-error';
import IJWTData from '../../interfaces/IJWTData';

export default (io: socketIo.Server): socketIo.Namespace => {
    return io.use(async (socket: socketIo.Socket, next) => {
        try {
            // get token from headers
            let accesstoken: string = socket.handshake.query.token;
            // extract credentials
            const jwtCredentials = jwt.verify(accesstoken, `${process.env.JWT_SECRET_KEY}`) as IJWTData;

            // load user
            const user = await User.findOne({ phoneNumber: jwtCredentials.sub });

            // check if the user exits
            if (user) {
                /**
                 * Check if the user account is locked
                 */
                if (user.lockedAt) {
                    throw {
                        message: 'Your account has been locked. Contact support.'
                    };
                } else {
                    return next();
                }
            } else {
                throw {
                    message: 'Invalid connection token.'
                };
            }
        } catch (err) {
            console.log('socket middleware error', err);
            return next(serializeError(err))
        }
    });
};