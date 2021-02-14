import mongoose, { Document, HookErrorCallback, Model, Schema } from "mongoose";

export declare type OnDeleteFuncOptions<T extends Document = any> = {
  /**
   * On delete action
   */
  action?: "cascade" | "restrict" | "set_null";

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
  schema: Schema<T>,
  options: OnDeleteFuncOptions<T>
) {
  // model deifinitions
  const definitions = schema.obj;

  // delete action
  const deleteAction = options.action ?? "restrict";

  /**
   * Post delete
   */
  schema.pre<T>(
    "remove",
    async function (next) {
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
            const element = definitions[key];
            if (element.ref === (this.constructor as any).modelName) {
              foreignHosts.push([modelName, key]);
              break;
            }
          }
        }
      }

      // init error
      var error: mongoose.NativeError | null = null;

      for (const [modelName, key] of foreignHosts) {
        // filters
        const filters: any = {};
        // set filter
        filters[key] = { $in: [this._id] };
        // break point
        var mustBreak = false;

        if (deleteAction === "restrict") {
          const count = await mongoose
            .model(modelName)
            .find(filters)
            .countDocuments();
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
          const count = await mongoose
            .model(modelName)
            .find(filters)
            .countDocuments();
          if (count !== 0) {
            try {
              await mongoose
                .model(modelName)
                .find(filters)
                .then(async (docs) => {
                  for (const record of docs) {
                    await record.remove();
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
            } catch (error) {
              // force break
              mustBreak = true;
              // set error
              error = {
                message: error.message ?? `Failed to delete the record.`,
                name: "ON DELETE CASCADE",
              };
            }
            break;
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
              message: error.message ?? `Failed to update dependent records.`,
              name: "ON DELETE SET_NULL",
            };
          }
        }

        // break if asked
        if (mustBreak) break;
      }

      // continue
      if (error) {
        next(error);
      } else {
        next();
      }
    },
    options.errorCb
  );
}
