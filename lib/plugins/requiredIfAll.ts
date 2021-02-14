import mongoose, { Schema, HookErrorCallback, Document } from "mongoose";

export declare type RequiredIfAllDefinitionType<T extends Document = any> = {
  message?: string;
  validator: (instance: T) => Promise<boolean> | boolean;
};

export declare type RequiredIfAllFuncOptions<T extends Document = any> = {
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
export default async function RequiredIfAll<T extends Document = any>(
  schema: Schema<T>,
  options: RequiredIfAllFuncOptions<T>
) {
  // model deifinitions
  const definitions = schema.obj;

  // context
  const context = new Map<string, Array<RequiredIfAllDefinitionType<T>>>();

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

      if (element.requiredIfAll) {
        // exits
        const exists = [];

        if (!Array.isArray(element.requiredIfAll)) {
          element.requiredIfAll = [element.requiredIfAll];
        }

        // verify required with targets
        for (const rule of element.requiredIfAll as Array<
          RequiredIfAllDefinitionType<T>
        >) {
          if (!Object.keys(rule).includes("validator")) {
            console.error(
              new Error(
                `requiredIfAll -> the \`validator\` function is missing`
              )
            );
          } else if (typeof rule.validator !== "function") {
            console.error(
              new Error(`requiredIfAll -> the \`validator\` must be a bunction`)
            );
          } else {
            exists.push(rule);
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
    async function (next) {
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
            const rules = context.get(field);

            // valid rules count
            var match = 0;

            for (const rule of rules ?? []) {
              if (await rule.validator(this as any)) {
                match += 1;
              }
            }

            if (match === (rules ?? []).length) {
              error.addError(field, {
                message:
                  (rules ?? []).map((r) => r.message).length !== 0
                    ? (rules ?? []).map((r) => r.message).join("; ")
                    : `\`${field}\` is required.`,
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
