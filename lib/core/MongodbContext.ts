import { ConnectionOptions, connection, connect, Connection } from "mongoose";

export type MongoContextParams = {
  connectionUrl: string;
  options?: ConnectionOptions;
  afterConnect?:
    | ((connection: Connection) => Promise<void>)
    | ((connection: Connection) => void);
  onError?:
    | ((connection: Connection) => Promise<void>)
    | ((connection: Connection) => void);
};

class MongoContext {
  /**
   * Initialize mongodb connection
   */
  async init(params: MongoContextParams): Promise<void> {
    // listen connection
    const db = connection;

    /**
     * Catch error
     */
    db.on("error", async function () {
      console.error.bind(console, "MongoDB connection error:");
      // after connection
      if (params.onError) {
        await params.onError(db);
      }
    });

    /**
     * Once connection openned
     */
    db.once("open", async function () {
      console.log("We're connected on MongoDB!!");

      // after connection
      if (params.afterConnect) {
        await params.afterConnect(db);
      }
    });

    // trigger connection
    await connect(
      params.connectionUrl,
      params.options || {
        useCreateIndex: true,
        useNewUrlParser: true,
        useFindAndModify: false,
        useUnifiedTopology: true,
      }
    );
  }
}

export default new MongoContext();
