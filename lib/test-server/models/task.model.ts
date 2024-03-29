import { Document, Schema } from "mongoose";
import mongooseModel from "../../core/MongooseModel";

require("./user.model");

export interface ITask extends Document {
  user: any;
  name: string;
  title: string;
  description?: string;
  doubleName: string;
  createdAt: Date;
  updatedAt: Date;
  hello: (value: string) => void;
}

export default mongooseModel<ITask>({
  name: "Task",
  collection: "tasks",
  softDelete: false,
  onDeleteOptions: {
    action: "cascade",
    log: true,
  },
  schema: new Schema(
    {
      user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: [true, "The user is required"],
      },
      name: {
        type: Schema.Types.String,
        hidden: true,
      },
      title: {
        type: Schema.Types.String,
      },
      description: {
        type: Schema.Types.String,
        massAssignable: false,
        requiredWith: "user",
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
  plugins: function (schema: Schema<ITask>) {},
  externalConfig: function (schema) {},
});
