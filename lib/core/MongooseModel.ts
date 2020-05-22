import { Schema, model, Document } from "mongoose";
import mongoosePaginate from "mongoose-paginate";
import mongooseAutopopulate from "mongoose-autopopulate";
import mongooseLeanVirtuals from "mongoose-lean-virtuals";
import mongooseUniqueValidator from "mongoose-unique-validator";

const mongooseAggregatePaginate = require("mongoose-aggregate-paginate-v2");

export type MoongooseModelParams<T extends Document> = {
  /**
   * Model name
   */
  name: string;

  /**
   * Collection name (optional, induced from model name)
   */
  collection?: string;

  /**
   * Whether to skip initialization or not
   *
   * @default false
   */
  skipInit?: boolean;

  /**
   * The plugin automatically added when true is Mongoose Paginate
   *
   * @default true
   *
   * https://www.npmjs.com/package/mongoose-paginate
   */
  paginate?: boolean;

  /**
   * The plugin automatically added when true is Mongoose Aggregate Paginate V2
   *
   * @default true
   *
   * https://www.npmjs.com/package/mongoose-aggregate-paginate-v2
   */
  aggregatePaginate?: boolean;

  /**
   * Always populate() certain fields in your Mongoose schemas.
   *
   * Only apply this plugin to top-level schemas. Don't apply this plugin to child schemas.
   *
   * @default false
   *
   * https://www.npmjs.com/package/mongoose-autopopulate
   *
   * ```
   * const schema = new mongoose.Schema({
   *   populatedField: {
   *     type: mongoose.Schema.Types.ObjectId,
   *     ref: 'ForeignModel',
   *     // The below option tells this plugin to always call `populate()` on
   *     // `populatedField`
   *     autopopulate: true
   *   }
   * });
   * ```
   */
  autopopulate?: boolean;

  /**
   * Attach virtuals to the results of Mongoose queries when using .lean().
   *
   * @default true
   *
   * https://plugins.mongoosejs.io/plugins/lean-virtuals
   *
   *
   * ```
   * // Define virtual
   * userSchema.virtual('lowercase').get(function() {
   * return this.name.toLowerCase();
   * });
   *
   * // You **must** pass `virtuals: true` to `lean()`, otherwise `lowercase`
   * // won't be in `res`
   * const res = await UserModel.find().lean({ virtuals: true });
   * ```
   */
  leanVirtuals?: boolean;

  /**
   * Unique validation custom message
   *
   * @default true
   *
   * https://www.npmjs.com/package/mongoose-unique-validator
   */
  uniqueValidator?: boolean;

  /**
   * Unique validator message
   * 
   * You can pass through a custom error message as part of the optional options argument:
   * 
   * You have access to all of the standard Mongoose error message templating:
   * 
   * {PATH}
   * {VALUE}
   * {TYPE}
   * 
   * @default "Expected {PATH} to be unique."
   * 
   * https://www.npmjs.com/package/mongoose-unique-validator
   */
  uniqueValidatorMessage?: string;

  /**
   * Add globaly a plugin to a mongoose schema
   * https://mongoosejs.com/docs/plugins.html#global
   */
  plugins?: (schema: Schema) => void;

  /**
   * Mongoose schema defining the model
   */
  schema: Schema<T>;

  /**
   * Configure the schema created by adding methods, middlewares, virtuals and many other things provided by Mongoose
   * Methods - https://mongoosejs.com/docs/guide.html#methods
   * Middlewares - https://mongoosejs.com/docs/middleware.html
   * Virtuals - https://mongoosejs.com/docs/guide.html#virtuals
   *
   * ```
   * externalConfig: (schema) => {
   *     // Method example
   *     schema.methods = {
   *       verifyPassword: (value: string) => {
   *         // your code here
   *       },
   *     };
   *
   *     // Middleware example
   *     schema.pre("save", () => {
   *       // thing to do before save the object
   *     });
   *
   *     // Virtual example
   *     schema
   *       .virtual("customColumn")
   *       .get(() => {
   *         return "Hey" + "Hello";
   *       })
   *       .set((value: string) => {
   *         // your code here
   *       });
   *   }
   * ```
   */
  externalConfig?: (schema: Schema) => void;
};

/**
 * Create a mongoose model
 * @param params model definition parameters
 */
export default function mongooseModel<T extends Document>(
  params: MoongooseModelParams<T>
) {
  // apply external config
  if (params.externalConfig) {
    params.externalConfig(params.schema);
  }
  // apply plugins
  if (params.plugins) {
    params.plugins(params.schema);
  }

  /**
   * Default paginate
   */
  if (params.paginate !== false) {
    params.schema.plugin(mongoosePaginate);
  }

  /**
   * Aggregate query paginated
   */
  if (params.aggregatePaginate !== false) {
    params.schema.plugin(mongooseAggregatePaginate);
  }

  /**
   * Autopopulate
   */
  if (params.autopopulate == true) {
    params.schema.plugin(mongooseAutopopulate);
  }

  /**
   * Lean virtuals
   */
  if (params.leanVirtuals !== false) {
    params.schema.plugin(mongooseLeanVirtuals);
  }

  /**
   * Unique validator
   */
  if (params.uniqueValidator !== false) {
    params.schema.plugin(mongooseUniqueValidator, {
      message: params.uniqueValidatorMessage || "Expected {PATH} to be unique.",
    });
  }

  // return the model
  return model<T>(
    params.name,
    params.schema,
    params.collection,
    params.skipInit
  );
}