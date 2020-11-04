import { Document, Schema } from "mongoose";
import mongooseModel from "../../core/MongooseModel";
import { SoftDeleteDocument } from "mongoose-delete";

require("./user.model");

interface ITask extends SoftDeleteDocument {
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
  softDeleteOptions: {
    deletedAt: true,
    overrideMethods: true,
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
        hidden: false,
      },
      title: {
        type: Schema.Types.String,
      },
      description: {
        type: Schema.Types.String,
        massAssignable: false,
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
