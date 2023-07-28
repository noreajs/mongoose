import mongoose, { Schema, Document } from "mongoose";
import HookErrorCallback from "../interfaces/HookErrorCallback";

export declare type RequiredIfDefinitionType<T extends Document = any> = {
  message?: string;
  validator: (instance: T) => Promise<boolean> | boolean;
};

export declare type RequiredIfFuncOptions<T extends Document = any> = {
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
export default async function RequiredIf<T extends Document = any>(
  schema: Schema<any>,
  options: RequiredIfFuncOptions<T>
) {
  // model deifinitions
  const definitions = schema.obj;

  // context
  const context = new Map<string, Array<RequiredIfDefinitionType<T>>>();

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

      if (element.requiredIf) {
        // exits
        const exists: any = [];

        if (!Array.isArray(element.requiredIf)) {
          element.requiredIf = [element.requiredIf];
        }

        // verify required with targets
        for (const rule of element.requiredIf as Array<
          RequiredIfDefinitionType<T>
        >) {
          if (!Object.keys(rule).includes("validator")) {
            console.error(
              new Error(`requiredIf -> the \`validator\` function is missing`)
            );
          } else if (typeof rule.validator !== "function") {
            console.error(
              new Error(`requiredIf -> the \`validator\` must be a function`)
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

  schema.pre("save", async function (next) {
    try {
      const newObj = this.toJSON();
      const error = new mongoose.Error.ValidationError();

      for (const field of context.keys()) {
        if (
          (typeof newObj[field] !== "string" &&
            (newObj[field] === null || newObj[field] === undefined)) ||
          (typeof newObj[field] === "string" && `${newObj[field]}`.length === 0)
        ) {
          const rules = context.get(field);
          for (const rule of rules ?? []) {
            if (!(await rule.validator(this as any))) {
              error.addError(field, {
                message: rule.message ?? `\`${field}\` is required.`,
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
        next(error);
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
