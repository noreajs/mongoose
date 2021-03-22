import mongoose, { Schema, HookErrorCallback, Document } from "mongoose";

export declare type RequiredWithoutAllFuncOptions = {
  /**
   * Error callback
   */
  errorCb?: HookErrorCallback;
};

/**
 * Project model from mass assignment
 * @param schema mongoose schem
 * @param options options
 */
export default function RequiredWithoutAll<T extends Document = any>(
  schema: Schema<T>,
  options: RequiredWithoutAllFuncOptions
) {
  // model deifinitions
  const definitions = schema.obj;

  // context
  const context = new Map<string, Array<string>>();

  // model properties
  const modelProperties: Array<string> = [];

  // extract model properties
  for (const key in definitions) {
    if (Object.prototype.hasOwnProperty.call(definitions, key)) {
      modelProperties.push(key);
    }
  }

  /**
   * Extract inline definition
   */
  for (const key in definitions) {
    if (Object.prototype.hasOwnProperty.call(definitions, key)) {
      const element = definitions[key];

      if (element.requiredWithoutAll) {
        // exits
        const exists:any[] = [];

        if (!Array.isArray(element.requiredWithoutAll)) {
          element.requiredWithoutAll = [element.requiredWithoutAll];
        }

        // verify required with targets
        for (const target of element.requiredWithoutAll) {
          if (!modelProperties.includes(target)) {
            console.error(
              new Error(
                `requiredWithoutAll -> "${target}" is not a property of the model`
              )
            );
          } else {
            exists.push(target);
          }
        }

        // set the element
        if (exists.length !== 0) {
          context.set(key, exists);
        }
      }
    }
  }

  schema.pre(
    "save",
    function (next) {
      try {
        const newObj = this.toJSON();
        const error = new mongoose.Error.ValidationError(this);

        for (const field of context.keys()) {
          if (
            (typeof newObj[field] !== "string" &&
              (newObj[field] === null || newObj[field] === undefined)) ||
            (typeof newObj[field] === "string" &&
              `${newObj[field]}`.length === 0)
          ) {
            const targets = context.get(field);

            // undefined targets count
            var match = 0;

            for (const target of targets ?? []) {
              if (
                ((newObj[target] === null || newObj[target] === undefined) &&
                  typeof newObj[target] !== "string") ||
                (typeof newObj[target] === "string" &&
                  `${newObj[target]}`.length === 0)
              ) {
                match += 1;
              }
            }

            if (match === (targets ?? []).length) {
              error.addError(field, {
                message: `\`${field}\` is required when ${(targets ?? [])
                  .map((t) => `\`${t}\``)
                  .join(", ")} ${
                  (targets ?? []).length > 1
                    ? "are not present"
                    : "is not present"
                }`,
              });
            }
          }
        }

        // continue
        if (Object.keys(error.errors).length !== 0) {
          next(error);
        } else {
          next();
        }
      } catch (error) {
        next(error);
      }
    },
    options.errorCb
  );
}
