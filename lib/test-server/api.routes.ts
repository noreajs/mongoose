import { NoreaAppRoutes, Validator } from "@noreajs/core";
import { Application, Request, Response } from "express";
import { MongoRule } from "../validation/rules/MongoRule";
import stepModel, { IStep } from "./models/step.model";
import taskModel, { ITask } from "./models/task.model";
import userModel from "./models/user.model";

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
     * Clean
     */
    app.get("/clean", async (request: Request, response: Response) => {
      await userModel.remove({});
      await taskModel.remove({});
      await stepModel.remove({});
      return response.sendStatus(204);
    });

    /**
     * Fetch steps
     */
    app.get("/steps", async (request: Request, response: Response) => {
      const r = await stepModel.find({});
      return response.send(r);
    });

    /**
     * Fetch tasks
     */
    app.get("/tasks", async (request: Request, response: Response) => {
      const r = await taskModel.find({}).lean({ virtuals: true });
      return response.send(r);
    });

    /**
     * Fetch users
     */
    app.get("/users", async (request: Request, response: Response) => {
      const r = await userModel.find({}).lean({ virtuals: true });
      return response.json(r);
    });

    /**
     * Create task
     */
    app.route("/tasks").post([
      Validator.validateRequest("body", {
        user: {
          type: "string",
          required: true,
          rules: [MongoRule.validObjectId, MongoRule.exists("User", "_id")],
        },
      }),
      async (request: Request, response: Response) => {
        try {
          console.log("request.body.user", request.body.user);
          const r = await taskModel.create<Partial<ITask>>({
            user: request.body.user,
            name: request.body.name,
            description: request.body.description,
          });

          //
          await stepModel.create<Partial<IStep>>({
            task: r._id,
            title: `Step ${r._id}: this is not a number`,
          });

          await stepModel.create<Partial<IStep>>({
            task: r._id,
            title: `Step ${r._id}: this is not a number (bis)`,
          });
          // create steps

          response.send(r);
        } catch (error) {
          response.status(500).json(error);
        }
      },
    ]);

    /**
     * create user
     */
    app.route("/users").post([
      Validator.validateRequest("body", {
        name: {
          type: "string",
          required: true,
        },
        email: {
          type: "string",
        },
      }),
      async (request: Request, response: Response) => {
        try {
          // load user
          const user = new userModel({
            name: request.body.name,
            email: request.body.email,
          });

          await user.save();

          return response.status(201).json(user);
        } catch (error) {
          return response.status(500).json(error);
        }
      },
    ]);

    /**
     * Delete user
     */
    app.route("/users/:id").delete([
      Validator.validateRequest("params", {
        id: {
          type: "string",
          required: true,
          rules: [MongoRule.validObjectId, MongoRule.exists("User", "_id")],
        },
      }),
      async (request: Request, response: Response) => {
        try {
          // load user
          const user = await userModel.findById(request.params.id);
          if (user) {
            await user.remove();

            return response.status(204).send();
          } else {
            return response.status(404).send();
          }
        } catch (error) {
          return response.status(500).json(error);
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
