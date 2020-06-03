export type ILinearizeErrorsParams = {
  debugMode?: boolean;
};

/**
 * Linearize mongoose errors in a single line.
 * @param data execption data
 */
export const linearizeErrors = (data: any, params?: ILinearizeErrorsParams) => {
  // initialize the message
  let messages: Array<string> = [];
  // if errors exist
  if (data.errors) {
    for (const key in data.errors) {
      if (data.errors.hasOwnProperty(key)) {
        const element = data.errors[key];
        if (element?.message) {
          messages.push(element?.message);
        }
      }
    }
  }
  // if messages exists
  if (messages.length != 0) {
    data.message = messages.join("; ");
    if (params?.debugMode !== true) {
      try {
        data.errors = undefined;
        data._message = undefined;
        data.stack = undefined;
      } catch (e) {
        // some properties are readonly
      }
    }
  }
  return data;
};
