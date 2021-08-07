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
      if (value !== null && value !== undefined && `${value}`.length !== 0) {
        return ObjectId.isValid(value);
      } else {
        return true;
      }
    } catch (error) {
      return error.message ?? false;
    }
  },
};

export default validObjectIdRule;
