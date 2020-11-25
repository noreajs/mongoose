import { ObjectId } from "bson";
import { RuleType } from "../../interfaces/RuleType";

/**
 * Check if the value is a valid ObjectId
 */
const validObjectIdRule: RuleType = {
  message: (_value, field) => {
    return `\`${field}\` value must be a valid ObjectId`;
  },
  validator: (value) => {
    try {
      return ObjectId.isValid(value);
    } catch (error) {
      return error.message ?? false;
    }
  },
};

export default validObjectIdRule;
