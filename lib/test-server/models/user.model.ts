import { Schema } from "mongoose";
import mongooseModel from "../../core/MongooseModel";
import { SoftDeleteDocument } from "mongoose-delete";

interface IUser extends SoftDeleteDocument {
  name: string;
  email: string;
}

export default mongooseModel<IUser>({
  name: "User",
  collection: "users",
  softDeleteOptions: {
    deletedAt: true,
    overrideMethods: true,
  },
  onDeleteOptions: {
    action: "set_null",
  },
  schema: new Schema(
    {
      name: {
        type: Schema.Types.String,
      },
      email: {
        type: Schema.Types.String,
      },
    },
    {
      timestamps: true,
    }
  ),
});
