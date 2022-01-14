import { RequiredIfDefinitionType } from "./plugins/requiredIf";

export { RequiredIfDefinitionType } from "./plugins/requiredIf";

export {
  linearizeErrors,
  ILinearizeErrorsParams,
} from "./core/MongooseUtilities";

/**
 * Core tools definitions
 * -----------------------------
 */
export {
  default as mongooseModel,
  MoongooseModelParams,
} from "./core/MongooseModel";
export { default as MongoDBContext } from "./core/MongoDBContext";

/**
 * Plugins
 * -------------------
 */
export type { ProtectFuncOptions } from "./plugins/protect";
export { default as protect } from "./plugins/protect";
export type { OnDeleteFuncOptions } from "./plugins/onDelete";
export { default as onDelete } from "./plugins/onDelete";
export { MongoRule } from "./validation/rules/MongoRule";

/**
 * Interfaces
 * -----------------
 */
export type {
  DataOriginType,
  FieldType,
  FieldValidationOptions,
  HookErrorCallback,
  HookNextFunction,
  RuleType,
  ValidateOptions,
} from "./interfaces";

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
