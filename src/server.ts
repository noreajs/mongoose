import express, { Request, Response } from "express";
import bodyParser from 'body-parser';
import cors from 'cors';
import MongodbContext from "./config/mongodb/MongodbContext";
import ApiRoutes from "./routes/api.routes";

class Server {

    public app: express.Application;

    constructor() {
        this.app = express();

        // config
        this.config();

        // Set api routes
        ApiRoutes.routes(this.app);

        // set middleware
        ApiRoutes.middlewares(this.app);

        // Get MongoDB Instance
        MongodbContext.init();
    }

    private config(): void {
        // init cors
        this.app.use(cors());
        // support application/json type post data
        this.app.use(bodyParser.json());
        //support application/x-www-form-urlencoded post data
        this.app.use(bodyParser.urlencoded({ extended: false }));
    }
}

export default new Server().app;