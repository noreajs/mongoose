import {
    Schema,
    HookNextFunction,
    HookErrorCallback,
    Document,
  } from "mongoose";
  
  export declare type RequiredIfFuncOptions<T extends Document = any> = {
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
  export default function RequiredIf<T extends Document = any>(
    schema: Schema<T>,
    options: RequiredIfFuncOptions<T>
  ) {
  
  }
  