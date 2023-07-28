import mongoose, { Document, Schema } from "mongoose";
import HookErrorCallback from "../interfaces/HookErrorCallback";

export declare type RequiredWithoutFuncOptions = {
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
export default function RequiredWithout<T extends Document = any>(
  schema: Schema<any>,
  options: RequiredWithoutFuncOptions
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
      const element: any = definitions[key];

      if (element.requiredWithout) {
        // exits
        const exists: any[] = [];

        if (!Array.isArray(element.requiredWithout)) {
          element.requiredWithout = [element.requiredWithout];
        }

        // verify required with targets
        for (const target of element.requiredWithout) {
          if (!modelProperties.includes(target)) {
            console.error(
              new Error(
                `requiredWithout -> "${target}" is not a property of the model`
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

  schema.pre("save", function (next) {
    try {
      const newObj = this.toJSON();
      const error = new mongoose.Error.ValidationError();

      for (const field of context.keys()) {
        if (
          (typeof newObj[field] !== "string" &&
            (newObj[field] === null || newObj[field] === undefined)) ||
          (typeof newObj[field] === "string" && `${newObj[field]}`.length === 0)
        ) {
          const targets = context.get(field);
          for (const target of targets ?? []) {
            if (
              ((newObj[target] === null || newObj[target] === undefined) &&
                typeof newObj[target] !== "string") ||
              (typeof newObj[target] === "string" &&
                `${newObj[target]}`.length === 0)
            ) {
              error.addError(field, {
                message: `\`${field}\` is required when \`${target}\` is missing.`,
              } as any);
            }
          }
        }
      }

      // continue
      if (Object.keys(error.errors).length !== 0) {
        try {
          if (options.errorCb) {
            options.errorCb(error as any);
          }
        } catch (ignoredError) {}
        next(error as any);
      } else {
        next();
      }
    } catch (error) {
      try {
        if (options.errorCb) {
          options.errorCb(error as any);
        }
      } catch (ignoredError) {}
      next(error as any);
    }
  });
}
