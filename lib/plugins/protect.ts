import {
  Schema,
  HookNextFunction,
  HookErrorCallback,
  Document,
} from "mongoose";

export declare type ProtectFuncOptions<T extends Document = any> = {
  /**
   * Model attributes you want to make mass assignable
   */
  fillable?: Array<keyof T | string>;
  /**
   * Attributes on which you want to prevent mass assignment
   */
  guarded?: Array<keyof T | string>;

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
export default function protect<T extends Document = any>(
  schema: Schema<T>,
  options: ProtectFuncOptions<T>
) {
  // model deifinitions
  const definitions = schema.obj;

  // load options
  const fillable = Array.from<keyof T | string>(options.fillable ?? []);
  const guarded = Array.from<keyof T | string>(options.guarded ?? []);

  /**
   * Extract inline definition
   */
  for (const key in definitions) {
    if (Object.prototype.hasOwnProperty.call(definitions, key)) {
      const element = definitions[key];
      if (element.massAssignable === true) {
        fillable.push(key);
      } else if (element.massAssignable === false) {
        guarded.push(key);
      } else {
        if (fillable.includes(key)) {
          guarded.push(key);
        } else if (guarded.includes(key)) {
          fillable.push(key);
        }
      }
    }
  }

  /**
   * Check if a property is assignable or not
   * @param key property name
   */
  function isAssignableKey(key: string): boolean {
    return (
      fillable.includes(key) ||
      !guarded.includes(key) ||
      (!!options.guarded &&
        options.guarded.length === 0 &&
        fillable.length === 0)
    );
  }

  /**
   * Remove guarded attributes
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
        let newDoc: any = {};
        for (const key in doc) {
          if (Object.prototype.hasOwnProperty.call(doc, key)) {
            if (isAssignableKey(key)) {
              newDoc[key] = doc[key];
            }
          }
        }
        // replace the doc
        docs[index] = newDoc;
      }
      next();
    } catch (error) {
      next(error);
    }
  }

  /**
   * Push nested to root
   * @param obj object
   * @param attr attribute of object property
   */
  function pushNestedToParent(obj: any, attr: string | string[]) {
    if (!Array.isArray(attr)) {
      attr = [attr];
    }

    for (const attrKey of attr) {
      for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
          if (key === attrKey && typeof obj[key] === "object") {
            const nested = obj[key];
            for (let index = 0; index < Object.keys(nested).length; index++) {
              const nestedKey = Object.keys(nested)[index];
              obj[nestedKey] = nested[nestedKey];
            }
            delete obj[key];
          }
        }
      }
    }
  }

  /**
   * Update filter
   * @param updates updates
   */
  function updateMethodsFilter(updates: any) {
    // push $set and $setOrInsert to root
    pushNestedToParent(updates, ["$set", "$setOnInsert"]);
    // filter updates
    for (const key in updates) {
      if (Object.prototype.hasOwnProperty.call(updates, key)) {
        if (!isAssignableKey(key)) {
          delete updates[key];
        }
      }
    }
  }

  /**
   * Mass update
   */
  schema.pre(
    "updateMany",
    function (next) {
      try {
        // apply update method filter
        updateMethodsFilter(this.getUpdate());
        // continue
        next();
      } catch (error) {
        next(error);
      }
    },
    options.errorCb
  );

  schema.pre(
    "update",
    function (next) {
      try {
        // apply update method filter
        updateMethodsFilter(this.getUpdate());
        // continue
        next();
      } catch (error) {
        next(error);
      }
    },
    options.errorCb
  );

  schema.pre(
    "updateOne",
    function (next) {
      try {
        // apply update method filter
        updateMethodsFilter(this.getUpdate());
        // continue
        next();
      } catch (error) {
        next(error);
      }
    },
    options.errorCb
  );

  /**
   * Mass insert
   */
  schema.pre(
    "insertMany",
    function (next, docs) {
      applyFilter(docs, next);
    },
    options.errorCb
  );
}
