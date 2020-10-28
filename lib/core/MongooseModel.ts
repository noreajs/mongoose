import { Schema, model, Document, connection } from "mongoose";
import mongoosePaginate from "mongoose-paginate";
import mongooseAutopopulate from "mongoose-autopopulate";
import mongooseLeanVirtuals from "mongoose-lean-virtuals";
import mongooseUniqueValidator from "mongoose-unique-validator";
import mongooseDelete from "mongoose-delete";
import protect, { ProtectFuncOptions } from "../plugins/protect";
import privacy, { PrivacyFuncOptions } from "../plugins/privacy";
import RequiredWith from "../plugins/requiredWith";
import RequiredIf from "../plugins/requiredIf";
import RequiredWithout from "../plugins/requiredWithout";

const mongooseAggregatePaginate = require("mongoose-aggregate-paginate-v2");

export type QueryMethod = "find" | "findOne" | "findById" | string;

export type GlobalFilter<T extends Document> = {
  [key in QueryMethod]?: (docs: T[]) => void;
};

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
   * @default true
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
   * Makes the indexes in MongoDB match the indexes defined in this model's schema. This function will drop any indexes that are not defined in the model's schema except the _id index, and build any indexes that are in your schema but not in MongoDB.
   *
   * @default true
   */
  syncIndexes?: boolean;

  /**
   * syncIndexes options to pass to ensureIndexes()
   */
  syncIndexesOptions?: object | null | undefined;

  /**
   * syncIndexes optional callback
   */
  syncIndexesCallback?: (err: any) => void;

  /**
   * Configure the schema created by adding methods, middlewares, virtuals and many other things provided by Mongoose
   * Methods - https://mongoosejs.com/docs/guide.html#methods
   * Middlewares - https://mongoosejs.com/docs/middleware.html
   * Virtuals - https://mongoosejs.com/docs/guide.html#virtuals
   *
   * ```
   * externalConfig: function (schema) {
   *     // Method example
   *     schema.methods = {
   *       verifyPassword: function (value: string) {
   *         // your code here
   *       },
   *     };
   *
   *     // Middleware example
   *     schema.pre("save", function () {
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

  /**
   * Define virtuals field
   *
   * @description For more flexibility define your virtuals in externalConfig method
   */
  virtuals?: [
    {
      fieldName: string;
      options?: any;
      get: (this: T) => any | Promise<any>;
      set?: (this: T) => void | Promise<void>;
    }
  ];

  /**
   * Define model methods
   *
   * @description For more flexibility define your virtuals in externalConfig method
   */
  methods?: {
    [K in keyof Partial<T>]: (this: T, ...rest: any[]) => any | Promise<any>;
  };

  /**
   * Configure soft delete
   * https://github.com/dsanel/mongoose-delete
   *
   * @default true
   */
  softDelete?: boolean;

  /**
   * Soft delete options
   */
  softDeleteOptions?: {
    /**
     * Who has deleted the data?
     */
    deletedBy?: boolean;

    /**
     * Save time of deletion
     */
    deletedAt?: boolean;

    /**
     * We have the option to override all standard methods or only specific methods
     */
    overrideMethods?: boolean | string | string[];

    /**
     * Disable model validation on delete
     */
    validateBeforeDelete?: boolean;

    /**
     * Create index on fields
     */
    indexFields?: boolean | string | string[];

    /**
     * Disable use of $ne operator
     */
    use$neOperator?: boolean;
    [key: string]: any;
  };

  /**
   * Protect attributes from mass assignment
   */
  protectOptions?: ProtectFuncOptions;

  /**
   * Display or hide attributes
   */
  privacyOptions?: PrivacyFuncOptions;

  /**
   * Query global filters
   */
  postFilters?: GlobalFilter<T>;
};

/**
 * Create a mongoose model
 * @param params model definition parameters
 */
export default function mongooseModel<T extends Document>(
  params: MoongooseModelParams<T>
) {
  // the schema
  const schema = params.schema;

  /**
   * Virtuals fields
   */
  if (params.virtuals) {
    for (const v of params.virtuals) {
      const field = schema.virtual(v.fieldName, v.options).get(v.get);
      if (v.set) {
        field.set(v.set);
      }
    }
  }

  /**
   * Methods
   * #Must purpose to the mongoose official !important
   */
  if (params.methods) {
    schema.methods = params.methods as any;
  }

  /**
   * Default paginate
   */
  if (params.paginate !== false) {
    schema.plugin(mongoosePaginate);
  }

  /**
   * Aggregate query paginated
   */
  if (params.aggregatePaginate !== false) {
    schema.plugin(mongooseAggregatePaginate);
  }

  /**
   * Autopopulate
   */
  if (params.autopopulate !== false) {
    schema.plugin(mongooseAutopopulate);
  }

  /**
   * Lean virtuals
   */
  if (params.leanVirtuals !== false) {
    schema.plugin(mongooseLeanVirtuals);
  }

  /**
   * Unique validator
   */
  if (params.uniqueValidator !== false) {
    schema.plugin(mongooseUniqueValidator, {
      message: params.uniqueValidatorMessage || "Expected {PATH} to be unique.",
    });
  }

  /**
   * Soft delete
   */
  if (
    params.softDelete === true ||
    (!!params.softDeleteOptions &&
      Object.keys(params.softDeleteOptions).length !== 0)
  ) {
    schema.plugin(mongooseDelete, params.softDeleteOptions as any);
  }

  /**
   * Apply protect
   */
  if (!!params.protectOptions) {
    schema.plugin(protect, params.protectOptions);
  }

  /**
   * Apply privacy
   */
  if (!!params.privacyOptions) {
    schema.plugin(privacy, params.privacyOptions);
  }

  /**
   * Native plugins
   */
  schema.plugin(RequiredWith, {});
  schema.plugin(RequiredWithout, {});
  schema.plugin(RequiredIf, {});

  /**
   * Apply global filters on post middleware
   */
  if (!!params.postFilters) {
    // iterate post filters
    for (const key in params.postFilters) {
      if (Object.prototype.hasOwnProperty.call(params.postFilters, key)) {
        // load method
        const method = params.postFilters[key];

        if (method) {
          // define post event
          schema.post<T>(key, function (docs: any, next) {
            if (!Array.isArray(docs)) {
              docs = [docs];
            }

            // apply filter
            method(docs);

            // continue
            next();
          });
        }
      }
    }
  }

  // apply plugins
  if (params.plugins) {
    params.plugins(schema);
  }

  // apply external config
  if (params.externalConfig) {
    params.externalConfig(schema);
  }

  // create model
  const m = model<T>(params.name, schema, params.collection, params.skipInit);

  // listen to mongoose db connection
  connection.on("open", (err) => {
    // synchronize index
    if (params.syncIndexes !== false) {
      if (params.syncIndexesCallback) {
        m.syncIndexes(params.syncIndexesOptions, params.syncIndexesCallback);
      } else {
        m.syncIndexes(params.syncIndexesOptions);
      }
    }
  });

  // return the model
  return m;
}
