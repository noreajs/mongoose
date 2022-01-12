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
  static syncIndexes: Map<
    string,
    {
      enabled?: boolean;
      options?: Record<string, any>;
      callback?: (err: any) => void;
    }
  > = new Map<
    string,
    {
      enabled?: boolean;
      options?: Record<string, any>;
      callback?: (err: any) => void;
    }
  >();
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
      try {
        for (const modelName of MongoDBContext.syncIndexes.keys()) {
          const options = MongoDBContext.syncIndexes.get(modelName);
          if (options) {
            if (options.enabled !== false) {
              if (options.callback) {
                db.models[modelName].syncIndexes(
                  options.options ?? null,
                  options.callback
                );
              } else {
                db.models[modelName].syncIndexes(options.options);
              }
            }
          }
        }
      } catch (error) {
        console.error("Failed to synchronize indexes", error);
      }
      // after connection
      if (params.onConnect) {
        await params.onConnect(db);
      }
    });

    try {
      // trigger connection
      await connect(params.connectionUrl, params.options);
    } catch (error) {
      if (params.onError) {
        await params.onError(db, error);
      }
    }
  }
}

export default MongoDBContext;
