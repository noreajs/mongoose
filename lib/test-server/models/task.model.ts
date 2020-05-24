import { Document, Schema } from "mongoose";
import mongooseModel from "../../core/MongooseModel";

interface ITask extends Document {
  name: string;
  description?: string;
  doubleName: string;
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
  virtuals: [
    {
      fieldName: "doubleName",
      get: function () {
        const s = this as any;
        return s.name + " " + s.name;
      },
    },
  ],
  plugins: (schema: Schema<any>) => {},
  externalConfig: (schema: Schema<any>) => {},
});
