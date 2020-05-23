import { NoreaAppRoutes } from "@noreajs/core";
import { Application, Request, Response } from "express";
import taskModel from "./test-server/models/task.model";

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

    app.get("/tasks", async (request: Request, response: Response) => {
      const r = await taskModel.paginate({});
      response.send(r);
    });
  },
  middlewares(app: Application): void {},
});
