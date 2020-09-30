import {
  Schema,
  HookNextFunction,
  HookErrorCallback,
  Document,
} from "mongoose";

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
  schema: Schema<T>,
  options: PrivacyFuncOptions<T>
) {
  // model deifinitions
  const definitions = schema.obj;

  // load options
  const visible = Array.from<keyof T | string>(options.visible ?? []);
  const hidden = Array.from<keyof T | string>(options.hidden ?? []);

  // global options have been set
  const globalOptionsDefined = visible.length !== 0 || hidden.length !== 0;

  /**
   * Extract inline definition
   */
  for (const key in definitions) {
    if (Object.prototype.hasOwnProperty.call(definitions, key)) {
      const element = definitions[key];
      if (element.hidden === false) {
        visible.push(key);
      } else if (element.hidden === true) {
        hidden.push(key);
      } else if (!globalOptionsDefined) {
        visible.push(key);
      }
    }
  }

  /**
   * Check if a property is visible or not
   * @param key property name
   */
  function isVisibleKey(key: string): boolean {
    return visible.includes(key) || !Object.keys(definitions).includes(key);
  }

  /**
   * Remove hidden attributes
   * @param docs mongoose document
   * @param next next function hook
   */
  function applyFilter(docs: any, next: HookNextFunction) {
    try {
      // for array
      if (!Array.isArray(docs)) {
        docs = [docs];
      }
      for (let index = 0; index < docs.length; index++) {
        const doc = docs[index];

        for (const key in doc) {
          if (Object.prototype.hasOwnProperty.call(doc, key)) {
            if (!isVisibleKey(key)) {
              delete doc[key];
            }
          }
        }

        for (const key in doc._doc) {
          if (Object.prototype.hasOwnProperty.call(doc._doc, key)) {
            if (!isVisibleKey(key)) {
              delete doc._doc[key];
            }
          }
        }
      }
      
      next();
    } catch (error) {
      next(error);
    }
  }

  /**
   * Filtering data
   */
  schema.post(["find", "findOne", "findById"] as any, function (
    docs,
    next: any
  ) {
    // apply filter
    applyFilter(docs, next);
  });
}
