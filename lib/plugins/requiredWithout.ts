import {
  Schema,
  HookNextFunction,
  HookErrorCallback,
  Document,
} from "mongoose";

export declare type RequiredWithoutFuncOptions<T extends Document = any> = {
  /**
   * Error callback
   */
  errorCb?: HookErrorCallback;
};

/**
 * Project model from mass assignment
 * @param schema mongoose schem
 * @param options options
 */
export default function RequiredWithout<T extends Document = any>(
  schema: Schema<T>,
  options: RequiredWithoutFuncOptions<T>
) {

}
