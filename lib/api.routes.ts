import { NoreaAppRoutes } from "@noreajs/core";
import { Application, Request, Response } from "express";

export default new NoreaAppRoutes({
  routes(app: Application): void {
    /**
     * Api home
     */
    app.get("/", (request: Request, response: Response) => {
      response.send({
        title: "Noreajs Mongoose test server",
        description: "Mongoose tools for NoreaJs",
        contact: {
          name: "OvniCode Team",
          email: "team@ovnicode.com",
        },
      });
    });
  },
  middlewares(app: Application): void {},
});
