import { Request } from "express";

export type DataOriginType = "query" | "body" | "params";
export type FieldType =
  | "any"
  | "string"
  | "object"
  | "array"
  | "bool"
  | "date"
  | "timestamp"
  | "number"
  | "double"
  | "int"
  | "long"
  | "decimal";

export type ValidateOptions<BodyType = any> = {
  [key in keyof BodyType]: FieldValidationOptions;
};

export interface FieldValidationOptions<Type = any> {
  type: FieldType | [FieldType, string];
  required?: boolean | string;
  rules?: RuleType[];
  validator?: ValidateOptions<Type>;
}

export interface RuleType {
  message?:
    | string
    | ((
        value: any,
        field: string,
        origin: DataOriginType,
        options: FieldValidationOptions,
        data: any,
        request: Request
      ) => string | Promise<string>);
  validator: (
    value: any,
    field: string,
    origin: DataOriginType,
    options: FieldValidationOptions,
    data: any,
    request: Request
  ) => Promise<string | boolean> | string | boolean;
}
