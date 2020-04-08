import socketIo from 'socket.io';
import socketIoAuthMiddleware from './socket.io.auth.middleware';
import {
    connectuser,
    disconnectUser
} from './socket.io.methods';

class SocketIoServer {
    // current socket io server
    static io: socketIo.Server;

    /**
     * Listening to socket connection
     * @param io Socket.io server
     */
    listenConnection(io: socketIo.Server) {
        // set the current io server
        SocketIoServer.io = io;

        /**
         * Waiting for private client connection
         */
        socketIoAuthMiddleware(io).on('connect', (socket: socketIo.Socket) => {
            // connect the user
            connectuser(io, socket);

            socket.on('disconnect', function () {
                // disconnect user
                disconnectUser(io, socket);

            })
        });
    }

    /**
     * Get the current socket.io server
     */
    io(): socketIo.Server {
        return SocketIoServer.io;
    }
}

export default new SocketIoServer() as SocketIoServer;