import { Document, Schema } from "mongoose";
import mongooseModel from "../../core/MongooseModel";

interface ITask extends Document {
  name: string;
  description?: string;
  doubleName: string;
  createdAt: Date;
  updatedAt: Date;
  hello: (value: string) => void;
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
      timestamps: true,
    }
  ),
  virtuals: [
    {
      fieldName: "doubleName",
      get: function () {
        return this.name + " " + this.name;
      },
    },
  ],
  methods: {
    hello: function (message: string) {
      console.log(`Hello ${this.name}! ${message}`);
    },
  },
  plugins: function (schema: Schema<any>) {},
  externalConfig: function (schema, model) {
  },
});
