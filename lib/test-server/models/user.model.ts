import { Document, Schema } from "mongoose";
import mongooseModel from "../../core/MongooseModel";

interface IUser extends Document {
  name: string;
  email: string;
}

export default mongooseModel<IUser>({
  name: "User",
  collection: "users",
  softDelete: false,
  onDeleteOptions: {
    action: "cascade",
    log: true
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
