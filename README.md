# NoreaJs Mongoose


NoreaJs Mongoose is a package which contains a set of tools intended to facilitate the use of mongoose.

# Initial Features

- Model creation
- Extraction of errors during validations


### Model creation

Mongoose is the ideal tool when working with MongoDB. Very often to create a model, there is a set of information to take into account and the organization of the different elements constituting a model can become complicated. This package offers you a relatively simple way to proceed to create a model.

Full example of model declaration:
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
  autopopulate: true, // optional, default true
  paginate: true, // optional, default true
  aggregatePaginate: true, // optional, default true
  leanVirtuals: true, // optional, default true
  uniqueValidator: true,  // optional, default true
  plugins: (schema: Schema<any>) => {
      // add your mongoose plugin here
  },
  externalConfig: (schema: Schema<any>) => {
      // Define methods, virtuals and middlewares here
  },
});

```

The generic method used is **mongooseModel<T>**.

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
  plugins?: (schema: Schema) => void;
  schema: Schema<T>;
  externalConfig?: (schema: Schema) => void;
}
```

MoongooseModelParams<T> descriptions:
| Attribute              | Type            | Optional | Default                       | Description                                                                                                                                                                                                                                                                                             |
|------------------------|-----------------|----------|-------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| name                   | string          | false    |                               | Model name                                                                                                                                                                                                                                                                                              |
| collection             | string          | true     |                               | Collection name (optional, induced from model name)                                                                                                                                                                                                                                                     |
| skipInit               | boolean         | true     | false                         | Whether to skip initialization or not                                                                                                                                                                                                                                                                   |
| paginate               | boolean         | true     | true                          | The plugin automatically added when true is Mongoose Paginate                                                                                                                                                                                                                                           |
| aggregatePaginate      | boolean         | true     | true                          | The plugin automatically added when true is Mongoose Aggregate Paginate V2                                                                                                                                                                                                                              |
| autopopulate           | boolean         | true     | true                          | Always populate() certain fields in your Mongoose schemas. Only apply this plugin to top-level schemas. Don't apply this plugin to child schemas.                                                                                                                                                       |
| leanVirtuals           | boolean         | true     | true                          | Attach virtuals to the results of Mongoose queries when using .lean().                                                                                                                                                                                                                                  |
| uniqueValidator        | boolean         | true     | true                          | Catch unique validation error like normal validation error                                                                                                                                                                                                                                              |
| uniqueValidatorMessage | string          | true     | Expected {PATH} to be unique. | Unique validator message  You can pass through a custom error message as part of the optional options argument: You have access to all of the standard Mongoose error message templating: :{PATH}, {VALUE}, {TYPE}                                                                                      |
| plugins                | function        | true     |                               | Add globaly a plugin to a mongoose schema                                                                                                                                                                                                                                                               |
| schema                 | mongoose.Schema | true     |                               | Mongoose schema defining the model                                                                                                                                                                                                                                                                      |
| externalConfig         | function        | true     |                               | Configure the schema created by adding methods, middlewares, virtuals and many other things provided by Mongoose  - Methods - https://mongoosejs.com/docs/guide.html#methods  - Middlewares - https://mongoosejs.com/docs/middleware.html  - Virtuals - https://mongoosejs.com/docs/guide.html#virtuals |


### Extraction of errors during validations
Linearize Mongoose errors when you catch them. The method used is **linearizeErrors**.

Mongoose validation errors normaly look like this:
```json
{
    "message": "Validation Error: First error, second error and many other (maybe) unnecessary",
    "errors": {
      "fieldA": {
        "message": "The field A is required",
        "...": "..."
      },
      "fieldB": {
        "message": "Th field B is not required (lol)",
        "...": "..."
      }
    }
}
```

While using *linearizeErrors* method, the error data become:
```json
{
  "message": "This field A is required; Th field B is not required (lol)"
}
```

Example:
```typescript
try {
    const task = new Task({
        name: 'Install it',
        description: ''
    })
    
    await task.save();
} catch (e) {
    // linearize here
    linearizeErrors(e);

    // or
    // linearizeErrors(e, {debug: true}); // to keep the original 'errors' attribute

    // return the response
    return res.status(500).json(e);
}
```

### Todos

 - (more things will be added soon)

License
----

MIT