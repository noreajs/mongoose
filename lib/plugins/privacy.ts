import { Document, Schema } from "mongoose";
import HookErrorCallback from "../interfaces/HookErrorCallback";
import HookNextFunction from "../interfaces/HookNextFunction";
import { MongooseDefaultQueryMiddleware } from "mongoose";

export declare type PrivacyFuncOptions<T extends Document = any> = {
  /**
   * Model attributes you want to hide while fetching data
   */
  hidden?: Array<keyof T | string>;
  /**
   * Attributes visible while fetching data
   */
  visible?: Array<keyof T | string>;

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
export default function privacy<T extends Document = any>(
  schema: Schema<any>,
  options: PrivacyFuncOptions<T>
) {
  // model deifinitions
  const definitions = schema.obj;

  // load options
  const visible = Array.from<keyof T | string>(options.visible ?? []);
  const hidden = new Map<string, string[]>();

  // global options have been set
  const globalOptionsDefined = visible.length !== 0 || hidden.size !== 0;

  // methods
  const FETCH_METHODS: MongooseDefaultQueryMiddleware[] = ["find", "findOne"];
  /**
   * Extract inline definition
   */
  for (const key in definitions) {
    if (Object.prototype.hasOwnProperty.call(definitions, key)) {
      const element: any = definitions[key];
      if (element.hidden === false) {
        visible.push(key);
      } else if (element.hidden === true || Array.isArray(element.hidden)) {
        hidden.set(key, typeof element.hidden === "boolean" ? FETCH_METHODS : element.hidden);
      } else if (!globalOptionsDefined) {
        visible.push(key);
      }
    }
  }

  /**
   * Check if a property is visible or not
   * @param key property name
   */
  function isVisibleKey(key: string, func: "find" | "findOne"): boolean {
    const isVisible = visible.includes(key) || !Object.keys(definitions).includes(key);
    return isVisible || hidden.has(key) && (hidden.get(key) ?? []).includes(func);
  }

  /**
   * Remove hidden attributes
   * @param docs mongoose document
   * @param next next function hook
   */
  function applyFilter(docs: any, next: HookNextFunction, func: "find" | "findOne") {
    try {
      // for array
      if (!Array.isArray(docs)) {
        docs = [docs];
      }
      for (let index = 0; index < docs.length; index++) {
        const doc = docs[index];

        for (const key in doc) {
          if (Object.prototype.hasOwnProperty.call(doc, key)) {
            if (!isVisibleKey(key, func)) {
              delete doc[key];
            }
          }
        }

        /**
         * _doc is defined
         */
        if (doc._doc) {
          for (const key in doc._doc) {
            if (Object.prototype.hasOwnProperty.call(doc._doc, key)) {
              if (!isVisibleKey(key, func)) {
                delete doc._doc[key];
              }
            }
          }
        }
      }
      // console.log("docs", docs);
      next();
    } catch (error) {
      next(error as any);
    }
  }

  /**
   * Filtering data
   */
  schema.post("find", function (docs, next) {
    // apply filter
    if (docs) {
      applyFilter(docs, next, "find");
    } else {
      next();
    }
  });

  /**
 * Filtering data
 */
  schema.post("findOne", function (docs, next) {
    // apply filter
    if (docs) {
      applyFilter(docs, next, "findOne");
    } else {
      next();
    }
  });
}
