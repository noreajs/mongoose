import socketIo from 'socket.io';
import jwt from "jsonwebtoken";
import User from '../../models/User';
import IJWTData from '../../interfaces/IJWTData';


/**
 * Mark user as connected
 * 
 * @param socket socket connection
 */
export const connectuser = async (io: socketIo.Server, socket: socketIo.Socket) => {
    try {
        // get token from headers
        let accesstoken = socket.handshake.query.token;

        // extract credentials
        const jwtCredentials = jwt.verify(accesstoken, `${process.env.JWT_SECRET_KEY}`) as IJWTData;

        // load user
        const user = await User.findOne({ phoneNumber: jwtCredentials.sub });

        if (user) {
            // set changes
            user.online = true;
            user.socketId = socket.id;

            // save changes
            await user.save();
        }
    } catch (error) {
        // something bad happened
    }
}

/**
 * Mark user as disconnected
 * 
 * @param io socket io server
 * @param socket socket connection
 */
export const disconnectUser = async (io: socketIo.Server, socket: socketIo.Socket) => {
    // load related user
    const user = await User.findOne({ socketId: socket.id });

    // check if user exist
    if (user) {
        // set changes
        user.online = false;
        user.socketId = undefined;

        // save changes
        await user.save();
    }
}