import mongoose from "mongoose";

import * as http from 'http';
import * as https from 'http';
import Server from "./server";
import socketIoServer from "./config/socket.io/socket.io.server";
import socketIo from "socket.io";

var PORT = process.env.PORT || 9000;

// create server
const server = new (process.env.NODE_ENV?https.Server:http.Server)(Server);

// initialize socket io on the server
const io:socketIo.Server = socketIo(server);

server.listen(PORT, () => {
    console.log(`Environement : ${process.env.NODE_ENV || 'local'}`);
    console.log('Express server listening on port ' + PORT);

    // listening socket.io connections
    socketIoServer.listenConnection(io);
})