import {
  Document, Schema
} from "mongoose";
import HookErrorCallback from "../interfaces/HookErrorCallback";

export declare type ExistsValidationFuncOptions<T extends Document = any> = {
  /**
   * Error callback
   */
  errorCb?: HookErrorCallback;
};

/**
 * Exists validation
 * @param schema mongoose schem
 * @param options options
 */
export default function ExistsValidation<T extends Document = any>(
  schema: Schema<any>,
  options: ExistsValidationFuncOptions
) {
  // model deifinitions
  const definitions = schema.obj;

  // context
  const context = new Map<string, Array<string>>();


}
