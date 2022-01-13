import mongoose from "mongoose";
import { RuleType } from "../../interfaces/RuleType";

/**
 * Verify if a value exist in a model
 * @param modelName mongodb model
 * @param modelField model field
 */
const existsRule = (modelName: string, modelField?: string): RuleType => {
  return {
    message: (_value, field) => {
      return `\`${field}\` value must exists in the model \`${modelName}\``;
    },
    validator: async (value, field) => {
      try {
        if (value !== null && value !== undefined && `${value}`.length !== 0) {
          // construct query
          const query: any = {};
          query[modelField ?? field] = value;
          // the element exists
          return (await mongoose.model(modelName).findOne(query)) !== null;
        } else {
          return true;
        }
      } catch (error) {
        return (error as any).message ?? false;
      }
    },
  };
};

export default existsRule;
