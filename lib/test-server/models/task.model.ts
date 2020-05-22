import mongooseModel from "../../core/MongooseModel";
import { Document, Schema } from "mongoose";

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
      timestamps: true,
    }
  ),
  autopopulate: true,
  paginate: true,
  aggregatePaginate: true,
  leanVirtuals: true,
  uniqueValidator: true,
  plugins: (schema: Schema<any>) => {},
  externalConfig: (schema: Schema<any>) => {},
});
