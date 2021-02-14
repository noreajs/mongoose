# Norea.js Mongoose

Norea.js Mongoose is a package which contains a set of tools intended to facilitate the use of mongoose.

[![Version](https://img.shields.io/npm/v/@noreajs/mongoose.svg)](https://npmjs.org/package/@noreajs/mongoose)

[![Downloads/week](https://img.shields.io/npm/dw/@noreajs/mongoose.svg)](https://npmjs.org/package/@noreajs/mongoose)

[![License](https://img.shields.io/npm/l/@noreajs/cli.svg)](https://github.com/noreajs/mongoose/blob/master/package.json)

# Installation

The package already has his type definitions.

```powershell
npm install @noreajs/mongoose --save
```

# Initial Features

- MongoDB initialization
- Model creation
- Extraction of errors during validations

### MongoDB initialization

To use MongoDB in your application, initialization is required. To do so with this little baby package, here's how:

Import the MongoDB context:

```typescript
import { MongodbContext } from "@noreajs/mongoose";
```

Then use this line of code to initialize:

```typescript
MongodbContext.init({
  connectionUrl: `MONGODB_CONNECTION_URL`,
  options: {}, // optional
  onConnect: () => {}, // optional
  onError: () => {}, // optional
});
```

### Model creation

Mongoose is the ideal tool when working with MongoDB. Very often to create a model, there is a set of information to take into account and the organization of the different elements constituting a model can become complicated. This package offers you a relatively simple way to proceed to create a model.

Full example of model declaration: Task.ts file (or Task.js):

```typescript
import { mongooseModel, Document, Schema } from "@noreajs/mongoose";

interface ITask extends Document {
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export default mongooseModel<ITask>({
  name: "Task",
  collection: "tasks",
  schema: new Schema(
    {
      name: {
        type: Schema.Types.String,
        required: [true, "Task's name is required"],
      },
      description: {
        type: Schema.Types.String,
      },
    },
    {
      timestamps: true, // createdAt and UpdatedAt are created and managed by mongoose
    }
  ),
  // + other properties
});
```

After creating the model, you can import it anywhere and use it.

#### Some details

The generic method used is **mongooseModel<T>**, Where T is the interface which describes the model, and which must extend the mongoose **Document** interface.

The parameter of method mongooseModel is of the generic type **MoongooseModelParams<T>**;

```typescript
type MoongooseModelParams<T extends Document> = {
  name: string;
  collection?: string;
  skipInit?: boolean;
  paginate?: boolean;
  aggregatePaginate?: boolean;
  autopopulate?: boolean;
  leanVirtuals?: boolean;
  uniqueValidator?: boolean;
  uniqueValidatorMessage?: string;
  softDelete?: boolean;
  softDeleteOptions?: {
    deletedBy?: boolean;
    deletedAt?: boolean;
    overrideMethods?: boolean | string | string[];
    validateBeforeDelete?: boolean;
    indexFields?: boolean | string | string[];
    use$neOperator?: boolean;
    [key: string]: any;
  };
  onDeleteOptions: {
    action?: "cascade" | "restrict" | "set_null" // default "restrict";
    errorCb?: HookErrorCallback;
  };
  virtuals?: [
    {
      fieldName: string;
      options?: any;
      get: Function;
      set?: Function;
    }
  ];
  protectOptions?: {
      fillable?: Array<keyof T | string>;
      guarded?: Array<keyof T | string>;
      errorCb?: HookErrorCallback;
  };
  privacyOptions?: {
      hidden?: Array<keyof T | string>;
      visible?: Array<keyof T | string>;
      errorCb?: HookErrorCallback;
  };
  postFilters?: {
      [key in QueryMethod]?: (docs: T[]) => void;
  };
  methods: {
    [K in keyof Partial<T>]: Function;
  };
  plugins?: (schema: Schema) => void;
  schema: Schema<T>;
  externalConfig?: (schema: Schema) => void;
};
```

MoongooseModelParams<T> descriptions:
| Attribute | Type | Optional | Default | Description |
|------------------------|------------------|----------|----------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| name | string | false | | Model name |
| collection | string | true | | Collection name \(optional, induced from model name\) |
| skipInit | boolean | true | false | Whether to skip initialization or not |
| paginate | boolean | true | true | The plugin automatically added when true is Mongoose Paginate |
| aggregatePaginate | boolean | true | true | The plugin automatically added when true is Mongoose Aggregate Paginate V2 |
| autopopulate | boolean | true | true | Always populate\(\) certain fields in your Mongoose schemas\. Only apply this plugin to top\-level schemas\. Don't apply this plugin to child schemas\. |
| leanVirtuals | boolean | true | true | Attach virtuals to the results of Mongoose queries when using \.lean\(\)\. |
| uniqueValidator | boolean | true | true | Catch unique validation error like normal validation error |
| uniqueValidatorMessage | string | true | Expected \{PATH\} to be unique\. | Unique validator message You can pass through a custom error message as part of the optional options argument: You have access to all of the standard Mongoose error message templating: :\{PATH\}, \{VALUE\}, \{TYPE\} |
| softDelete | boolean | true | false | Active soft delete on model |
| softDeleteOptions | any | true |  | Soft delete options |
| onDeleteOptions | any | true |  | On record delete options |
| plugins | function | true | | Add globally a plugin to a mongoose schema |
| schema | mongoose\.Schema | true | | Mongoose schema defining the model |
| virtuals | array | true | | Define the virtual attributes of the model |
| methods | object | true | | Define the methods associated with the models |
| externalConfig | function | true | | Configure the schema created by adding methods, middlewares, virtuals and many other things provided by Mongoose \- Methods \- https://mongoosejs\.com/docs/guide\.html\#methods \- Middlewares \- https://mongoosejs\.com/docs/middleware\.html \- Virtuals \- https://mongoosejs\.com/docs/guide\.html\#virtuals |
| protectOptions | object | true | | Prevent mass assignment on some attributes |
| privacyOptions | object | true | | hide or display some attributes while fetching data |
| postFilters | object | true | | Filters to apply on post middleware |

_Table made with [Table Convert](https://tableconvert.com/)_



### Todos

- (more things will be added soon)

## License

MIT
