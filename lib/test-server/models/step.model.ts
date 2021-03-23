import { Schema } from "mongoose";
import { SoftDeleteDocument } from "mongoose-delete";
import mongooseModel from "../../core/MongooseModel";
import { ITask } from "./task.model";

require("./task.model");

export interface IStep extends SoftDeleteDocument {
  task: ITask;
  title: string;
}

export default mongooseModel<ITask>({
  name: "Step",
  collection: "steps",
  softDelete: false,
  schema: new Schema(
    {
      task: {
        type: Schema.Types.ObjectId,
        ref: "Task",
        required: [true, "The user is required"],
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
  plugins: function (schema: Schema<ITask>) {},
  externalConfig: function (schema) {},
});
