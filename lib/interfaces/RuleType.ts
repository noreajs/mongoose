export type DataOriginType = "query" | "body" | "params";
export type FieldType =
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

export interface FieldValidationOptions {
  type: FieldType | [FieldType, string];
  required?: boolean | string;
  rules?: RuleType[];
}

export interface RuleType {
  message?:
    | string
    | ((
        value: any,
        field: string,
        origin: DataOriginType,
        options: FieldValidationOptions,
        data: any
      ) => string | Promise<string>);
  validator: (
    value: any,
    field: string,
    origin: DataOriginType,
    options: FieldValidationOptions,
    data: any
  ) => Promise<string | boolean> | string | boolean;
}
