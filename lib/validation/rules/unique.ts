import mongoose from "mongoose";
import { RuleType } from "../../interfaces/RuleType";

interface UniqueRuleOptions<T extends mongoose.Document> {
  /**
   * The mongodb model name
   */
  modelName: string;

  /**
   * Model's field to check, its take validation field as default value
   */
  field?: string;

  /**
   * Value to ignore or mongoose filter query
   */
  ignore?: string | mongoose.MongooseFilterQuery<Pick<T, "_id">>;
}

/**
 *
 * @param options
 */
function uniqueRule<T extends mongoose.Document = any>(
  options: UniqueRuleOptions<T>
): RuleType {
  return {
    message: (value, field) => {
      return `A record with \`${value}\` as \`${
        options.field ?? field
      }\` value already exists in the ${options.modelName} model`;
    },
    validator: async (value, field) => {
      try {
        if (value !== null && value !== undefined && `${value}`.length !== 0) {
          // field query
          const fieldQuery: any = {};
          fieldQuery[options.field ?? field] = value;

          // construct query
          const filter: {
            $and: any[];
          } = {
            $and: [],
          };

          // inject field query in filter
          filter.$and.push({ ...fieldQuery });

          // ignore option
          if (options.ignore) {
            if (
              typeof options.ignore === "object" &&
              options.ignore.constructor === Object
            ) {
              filter.$and.push({ ...options.ignore });
            } else {
              // field query
              const ignoreQuery: any = {};

              if (Array.isArray(options.ignore)) {
                ignoreQuery[options.field ?? field] = { $nin: options.ignore };
              } else {
                ignoreQuery[options.field ?? field] = { $ne: options.ignore };
              }

              // inject ignore query
              filter.$and.push({ ...ignoreQuery });
            }
          }

          // the element exists
          return !(await mongoose.model(options.modelName).findOne(filter));
        } else {
          return true;
        }
      } catch (error) {
        return (error as any).message ?? false;
      }
    },
  };
}

export default uniqueRule;
