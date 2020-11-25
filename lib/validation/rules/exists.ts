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
        // construct query
        const query: any = {};
        query[modelField ?? field] = value;
        // the element exists
        return (await mongoose.model(modelName).findOne(query)) !== null;
      } catch (error) {
        return error.message ?? false;
      }
    },
  };
};

export default existsRule;
