import { connection, connect, Connection, ConnectOptions } from "mongoose";

export type MongoDBContextParams = {
  /**
   * MongoDB connection URL
   */
  connectionUrl: string;

  /**
   * MongoDB connection options
   */
  options?: ConnectOptions;

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
  static init(params: MongoDBContextParams): Promise<void> {
    return new Promise<void>(async (resolve, reject) => {
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

        // initialization failed
        reject();
      });

      // /**
      //  * Once connection openned
      //  */
      // db.once("open", async function () {
      //   console.log("mongodb opened");
      // });

      try {
        // trigger connection
        await connect(
          params.connectionUrl,
          params.options ?? {},
          async (error) => {
            /**
             * Error not defined
             */
            if (error !== null && error !== undefined) {
              if (params.onError) {
                try {
                  await params.onError(db, error);
                } catch (ignoredError) {
                  // initialization failed
                  reject(ignoredError);
                }
              }

              // initialization failed
              reject(error);
            } else {
              /**
               * Indexes synchronization
               * --------------------------
               */
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

              /**
               * Connection callback
               * -------------------------
               */
              if (params.onConnect) {
                await params.onConnect(db);
              }

              // continue
              resolve();
            }
          }
        );
      } catch (error) {
        if (params.onError) {
          try {
            await params.onError(db, error);
          } catch (ignoredError) {}
        }

        // fail
        reject(error);
      }
    });
  }
}

export default MongoDBContext;
