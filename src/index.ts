import { NoreaApp } from '@noreajs/core';
import socketIo from "socket.io";
import bodyParser from 'body-parser';
import cors from 'cors';
import apiRoutes from './routes/api.routes';
import MongodbContext from './config/mongodb/MongodbContext';
import socketIoServer from "./config/socket.io/socket.io.server";

/**
 * Norea.Js app initialization
 */
const app = new NoreaApp(apiRoutes, {
    forceHttps: false,
    beforeStart: (app) => {
        // init cors
        app.use(cors());
        // support application/json type post data
        app.use(bodyParser.json());
        //support application/x-www-form-urlencoded post data
        app.use(bodyParser.urlencoded({ extended: false }));
        // Get MongoDB Instance
        MongodbContext.init();
    },
    afterStart: (app, server) => {
        console.log(`Environement : ${process.env.NODE_ENV || 'local'}`);
        console.log('Express server listening on port ');

        // initialize socket io on the server
        const io: socketIo.Server = socketIo(server);

        // listening socket.io connections
        socketIoServer.listenConnection(io);
    }
});

/**
 * Start your app
 */
app.start(3000)