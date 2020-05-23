import { NoreaApp } from "@noreajs/core";
import apiRoutes from "./api.routes";
import MongodbContext from "./core/MongoDBContext";

/**
 * Create a new NoreaJs App
 */
const app = new NoreaApp(apiRoutes, {
  forceHttps: false,
  beforeStart: (app) => {
    // Get MongoDB Instance
    MongodbContext.init({
      connectionUrl: `mongodb://127.0.0.1:27017/noreajs_mongoose_db?compressors=zlib`,
    });
  },
  afterStart: (app, server, port) => {
    console.log("@noreajs/mongoose test server");
    console.log("The api is running on port", port);
  },
});

/**
 * Start your app
 */
app.start(3000);
