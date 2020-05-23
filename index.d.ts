// Type definitions for @noreajs/mongoose
// Project: Norea.Js
// Definitions by: Arnold LAMBOU <https://github.com/lambou>

export * from "mongoose";
export {
  linearizeErrors,
  ILinearizeErrorsParams,
} from "./lib/core/MongooseUtilities";
export {
  default as mongooseModel,
  MoongooseModelParams,
} from "./lib/core/MongooseModel";
export { default as MongodbContext } from "./lib/core/MongodbContext";
export { MongoContextParams } from "./lib/core/MongodbContext";