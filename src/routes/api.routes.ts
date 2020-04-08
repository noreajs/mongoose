import { Request, Response, Application } from "express";
import authRoutes from "./auth.routes";
import userRoutes from "./user.routes";

class ApiRoutes {
    public routes(app: Application): void {
        /**
         * Api home
         */
        app.get('/', (request: Request, response: Response) => {
            response.send({
                "title": "Ocnode Api initial project",
                "description": "Initial api based on ocnode framework",
                "contact": {
                    "name": "OvniCode Team",
                    "email": "team@ovnicode.com"
                }
            });
        });

        /**
         * Auth routes
         */
        authRoutes(app)

        /**
         * Users routes
         */
        userRoutes(app);
    }

    public middlewares(app: Application): void {

    }
}

export default new ApiRoutes()