import { ConnectionOptions, connection, connect, Connection } from "mongoose";

export type MongoDBContextParams = {
  /**
   * MongoDB connection URL
   */
  connectionUrl: string;

  /**
   * MongoDB connection options
   */
  options?: ConnectionOptions;

  /**
   * Method to be executed when the connection to MongoDB has been etablished
   */
  onConnect?: (connection: Connection) => Promise<void> | void;

  /**
   * Method to be executed when an error occur during MongoDB connection
   */
  onError?: (connection: Connection, error?: any) => Promise<void> | void;
};

class MongoDBContext {
  constructor() {}
  /**
   * Initialize mongodb connection
   *
   * @param params Mongodb context params
   */
  static async init(params: MongoDBContextParams): Promise<void> {
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
      if (params.onConnect) {
        await params.onConnect(db);
      }
    });

    try {
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
    } catch (error) {
      if (params.onError) {
        await params.onError(db, error);
      }
    }
  }
}

export default MongoDBContext;
