import { Document, Schema } from "mongoose";
import mongooseModel from "../../core/MongooseModel";
import { ITask } from "./task.model";

require("./task.model");

export interface IStep extends Document {
  task: ITask;
  title: string;
}

export default mongooseModel<IStep>({
  name: "Step",
  collection: "steps",
  softDelete: false,
  schema: new Schema(
    {
      task: {
        type: Schema.Types.ObjectId,
        ref: "Task",
        required: [true, "The user is required"]
      },
      title: {
        type: Schema.Types.String,
        hidden: false,
      },
    },
    {
      timestamps: true,
    }
  ),
  plugins: function (schema: Schema<IStep>) {},
  externalConfig: function (schema) {},
});
