import { NoreaAppRoutes } from "@noreajs/core";
import { Application, Request, Response } from "express";
import taskModel, { ITask } from "./models/task.model";

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

    /**
     * Fetch tasks
     */
    app.get("/tasks", async (request: Request, response: Response) => {
      const r = await taskModel.find({}).lean({ virtuals: true });
      return response.send(r);
    });

    /**
     * Create task
     */
    app.route("/tasks").post([
      async (request: Request, response: Response) => {
        try {
          const r = await taskModel.create<Partial<ITask>>({
            user: request.body.user,
            name: request.body.name,
            description: request.body.description,
          });
          response.send(r);
        } catch (error) {
          response.status(500).json(error);
        }
      },
    ]);

    /**
     * Update many tasks
     */
    app.route("/tasks/mass").put([
      async (request: Request, response: Response) => {
        try {
          const r = await taskModel.updateMany(
            {},
            {
              $set: {
                name: request.body.name,
                description: request.body.description,
              },
            }
          );
          response.send(r);
        } catch (error) {
          response.status(500).json(error);
        }
      },
    ]);
  },
  middlewares(app: Application): void {},
});
