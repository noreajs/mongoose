import colors from "colors";
import mongoose, {
  Document, Schema
} from "mongoose";
import HookErrorCallback from "../interfaces/HookErrorCallback";


export declare type RefValidationFuncOptions<T extends Document = any> = {
  /**
   * Error callback
   */
  errorCb?: HookErrorCallback;
};

/**
 * Ref validation
 * @param schema mongoose schem
 * @param options options
 */
export default function RefValidation<T extends Document = any>(
  schema: Schema<any>,
  options: RefValidationFuncOptions
) {
  // model deifinitions
  const definitions = schema.obj;

  // context
  const context = new Map<string, string>();

  // extract model properties
  for (const key in definitions) {
    if (Object.prototype.hasOwnProperty.call(definitions, key)) {
      // definition
      const definition = definitions[key];

      if (Array.isArray(definition) && definition.length === 1) {
        const uniqueDef = definition[0];
        if (
          typeof definition === "object" &&
          Object.keys(definition).includes("ref")
        ) {
          context.set(key, uniqueDef["ref"]);
        }
      } else {
        if (
          typeof definition === "object" &&
          Object.keys(definition as any).includes("ref")
        ) {
          context.set(key, (definition as any)["ref"]);
        }
      }
    }
  }

  schema.pre("save", async function (next) {
    try {
      const newObj = this.toJSON();
      const error = new mongoose.Error.ValidationError();

      for (const field of context.keys()) {
        const value = newObj[field];
        const ref = context.get(field);

        if (
          ref &&
          value !== null &&
          value !== undefined &&
          (typeof value === "string" ? value.length !== 0 : true)
        ) {
          try {
            if (
              !(await mongoose
                .model(ref)
                .findById(value)
                .session(this.$session() ?? null))
            ) {
              error.addError(field, {
                message: `\`${field}\` value is not a valid \`${ref}\`.`,
              } as any);
            }
          } catch (error) {
            if ((error as any).name === "MissingSchemaError") {
              console.error(error);
              console.log(
                colors.yellow(
                  `ACTION REQUIRED: import the \`${ref}\` model in the \`${(this.constructor as any).modelName
                  }\` model and everywhere it is used as reference. => require("model-${ref.toLowerCase()}-path").`
                )
              );
              console.log(
                colors.cyan(
                  `This action is necessary to apply the validation process of the reference value.`
                )
              );
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
        } catch (ignoredError) { }
        next(error);
      } else {
        next();
      }
    } catch (error) {
      try {
        if (options.errorCb) {
          options.errorCb(error as any);
        }
      } catch (ignoredError) { }
      next(error as any);
    }
  });
}
