import { RequiredIfDefinitionType } from "./plugins/requiredIf";

export { RequiredIfDefinitionType } from "./plugins/requiredIf";

export {
  linearizeErrors,
  ILinearizeErrorsParams,
} from "./core/MongooseUtilities";
export {
  default as mongooseModel,
  MoongooseModelParams,
} from "./core/MongooseModel";
export { default as MongoDBContext } from "./core/MongoDBContext";
export { default as protect, ProtectFuncOptions } from "./plugins/protect";
export { MongoRule } from "./validation/rules/MongoRule";

declare global {
  interface SchemaTypeOpts<T> {
    requiredWith: string | Array<string>;
    requiredWithAll: string | Array<string>;
    requiredWithout: string | Array<string>;
    requiredWithoutAll: string | Array<string>;
    requiredIf: RequiredIfDefinitionType | Array<RequiredIfDefinitionType>;
    requiredIfAll: RequiredIfDefinitionType | Array<RequiredIfDefinitionType>;
  }
}
