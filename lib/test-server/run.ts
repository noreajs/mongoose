import { NoreaBootstrap } from "@noreajs/core";
import connectMongo from "connect-mongo";
import MongoDBContext from "../core/MongoDBContext";
import apiRoutes from "./api.routes";

/**
 * Create a new NoreaJs App
 */
const api = new NoreaBootstrap(apiRoutes, {
  forceHttps: false,
});

api.beforeInit(async (app) => {
  // Get MongoDB Instance
  await MongoDBContext.init({
    connectionUrl: `mongodb://127.0.0.1:27017/noreajs_mongoose_db?compressors=zlib`,
    onConnect: (connection) => {
      console.log("we are connected on mongodb");
      api.updateInitConfig({
        sessionOptions: {
          secret: "babayaga",
          store: connectMongo.create({
            client: connection.getClient() as any,
          }),
        },
      });
      console.log("setting updated");
    },
  });

  console.log("finished");
});

/**
 * Start your app
 */
api.start(3000);
