import mongoose, {
  Schema,
  HookNextFunction,
  HookErrorCallback,
  Document,
} from "mongoose";

import colors from "colors";

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
  schema: Schema<T>,
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
          Object.keys(definition).includes("ref")
        ) {
          context.set(key, definition["ref"]);
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
          const value = newObj[field];
          const ref = context.get(field);

          if (ref && value) {
            try {
              if (!(await mongoose.model(ref).findById(value))) {
                error.addError(field, {
                  message: `\`${field}\` value is not a valid \`${ref}\`.`,
                });
              }
            } catch (error) {
              if (error.name === "MissingSchemaError") {
                console.error(error);
                console.log(
                  colors.yellow(
                    `ACTION REQUIRED: import the \`${ref}\` model in the \`${(this.constructor as any).modelName}\` model and everywhere it is used as reference. => require("model-${ref.toLowerCase()}-path").`
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
