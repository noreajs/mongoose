import mongoose, { Document, Schema } from "mongoose";
import HookErrorCallback from "../interfaces/HookErrorCallback";

export declare type OnDeleteFuncOptions<T extends Document = any> = {
  /**
   * On delete action
   */
  action?: "cascade" | "restrict" | "set_null";

  /**
   * Display log
   *
   * @default false
   */
  log?: boolean;

  /**
   * Error callback
   */
  errorCb?: HookErrorCallback;
};

/**
 * Define the behavior of the model instance on delete
 * @param schema mongoose schem
 * @param options options
 */
export default function OnDelete<T extends Document = any>(
  schema: Schema<any>,
  options: OnDeleteFuncOptions<T>
) {
  // model deifinitions
  const definitions = schema.obj;

  // delete action
  const deleteAction = options.action ?? "restrict";

  const middlewareProcess = async function (next) {
    // load dependencies
    const modelNames = await mongoose.connection.modelNames();
    // foreign hosts
    const foreignHosts: [string, string][] = [];
    // browse names
    for (const modelName of modelNames) {
      // schema definition
      const definitions = mongoose.model(modelName).schema.obj;
      for (const key in definitions) {
        if (Object.prototype.hasOwnProperty.call(definitions, key)) {
          const element: any = definitions[key];
          if (element.ref === (this.constructor as any).modelName) {
            foreignHosts.push([modelName, key]);
            break;
          }
        }
      }
    }

    /**
     * Log defails
     */
    if (options.log == true) {
      console.log("onDelete: mongoose model count", modelNames.length);
      console.log("onDelete: foreign hosts", foreignHosts);
    }

    // init error
    var error: NativeError | null = null;

    for (const [modelName, key] of foreignHosts) {
      // filters
      const filters: any = {};
      // set filter
      filters[key] = { $in: [this._id] };
      // break point
      var mustBreak = false;

      // count documents
      const count = await mongoose
        .model(modelName)
        .find(filters)
        .countDocuments();

      /**
       * Log defails
       */
      if (options.log == true) {
        console.log(
          `onDelete: \`${modelName}\` total from \`${(this.constructor as any).modelName
          }\` match`,
          count
        );
      }

      if (deleteAction === "restrict") {
        if (count !== 0) {
          mustBreak = true;
          // set error
          error = {
            message: `This record can't be deleted because one or many records in the model \`${modelName}\` depends on it.`,
            name: "ON DELETE RESTRICT",
          };
          break;
        }
      } else if (deleteAction === "cascade") {
        if (count !== 0) {
          try {
            await mongoose
              .model(modelName)
              .find(filters)
              .then(async (docs) => {
                for (const record of docs) {
                  await mongoose
                    .model(modelName)
                    .findOneAndRemove({ _id: record._id });
                }
              })
              .catch((err) => {
                // force break
                mustBreak = true;
                // set error
                error = {
                  message:
                    err.message ??
                    `Failed to load the dependent records in the model \`${modelName}\`.`,
                  name: "ON DELETE CASCADE",
                };
              });
          } catch (e) {
            // force break
            mustBreak = true;
            // set error
            error = {
              message: (e as any).message ?? `Failed to delete the record.`,
              name: "ON DELETE CASCADE",
              stack: (e as any).stack,
            };
            break;
          }
        }
      } else if (deleteAction === "set_null") {
        try {
          // changes
          const changes: any = {};
          // set filter
          changes[key] = null;
          // mass update
          await mongoose
            .model(modelName)
            .updateMany(filters, {
              $set: changes,
            })
            .session(this.$session() ?? null);
        } catch (error) {
          // force break
          mustBreak = true;
          // set error
          error = {
            message:
              (error as any).message ?? `Failed to update dependent records.`,
            name: "ON DELETE SET_NULL",
          };
        }
      }

      // break if asked
      if (mustBreak) break;
    }

    // error exists
    if (error) {
      try {
        if (options.errorCb) {
          options.errorCb(error);
        }
      } catch (ignoredError) { }

      // continue
      next(error);
    } else {
      // continue
      next();
    }
  };

  // /**
  //  * Pre delete
  //  */
  // schema.pre(
  //   "remove",
  //   { document: true, query: false },
  //   middlewareProcess
  // );

  /**
   * Pre delete
   */
  schema.pre(
    "deleteOne",
    { document: true, query: true },
    middlewareProcess
  );

  /**
   * deleteMany
   * https://stackoverflow.com/questions/65853331/mongoose-deletemany-in-pre-hook-how-to-access-all-documents-that-will-be-delete
   */
}
