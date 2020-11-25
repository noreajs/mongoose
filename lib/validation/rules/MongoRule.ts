import validObjectIdRule from "./validObjectId";
import existsRule from "./exists";
import uniqueRule from "./unique";

export namespace MongoRule {
  export const validObjectId = validObjectIdRule;
  export const exists = existsRule;
  export const unique = uniqueRule;
}
