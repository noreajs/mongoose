import mongoose, { Schema } from "mongoose";
import mongoosePaginate from "mongoose-paginate";
import IUser from "../interfaces/IUser";
import validator from "validator";
import * as crypto from "crypto";
import { encrypt, verify } from "unixcrypt"

const model = (schema: mongoose.Schema) => {
    schema.plugin(mongoosePaginate);
    return mongoose.model<IUser>("User", schema, 'users');
};

const User = new mongoose.Schema({
    profilePicture: { type: String },
    username: {
        type: Schema.Types.String,
        required: [true, 'Username is required.'],
    },
    email: {
        type: Schema.Types.String,
        unique: true,
        required: true,
        validate: [
            {
                async validator(value: string): Promise<boolean> {
                    return validator.isEmail(value);
                },
                msg: `The email is not valid.`
            },
            {
                async validator(value: string): Promise<boolean> {
                    const self = this as IUser;
                    var row = self.$session() !== null ? await model(User).findOne({ email: value }).session(self.$session()) : await model(User).findOne({ email: value });
                    if (self.isNew) {
                        return row == null;
                    } else {
                        return row == null || row._id.equals(self._id);
                    }
                },
                msg: 'The email {VALUE} is already taken.'
            }
        ]
    },
    password: {
        type: Schema.Types.String,
        required: [true, 'The secret code is required.']
    },
    admin: {
        type: Schema.Types.Boolean,
        required: false,
        default: false
    },
    online: {
        type: Schema.Types.Boolean,
        required: false,
        default: false
    },
    socketId: {
        type: Schema.Types.String,
        required: false
    },
    locale: {
        type: Schema.Types.String,
        required: [true, 'The locale is required.']
    },
    emailVerifiedAt: {
        type: Schema.Types.Date,
        required: false,
    },
    createdAt: {
        type: Schema.Types.Date,
        required: true,
        default: Date.now
    },
    updatedAt: {
        type: Date
    },
    deletedAt: {
        type: Date
    },
    lockedAt: {
        type: Date
    }
})

User.methods = {
    /**
     * Encrypt and set secret code
     * @param password user secret code
     */
    setPassword(password: string) {
        // load current user
        const self = this as IUser;
        // Hashing user's salt and secret code with 1000 iterations, and sha512 digest
        self.password = encrypt(password, `$5`);
    },

    /**
     * Check secret code validity
     * @param password user secret code
     */
    verifyPassword(password: string): boolean {
        // load current user
        const self = this as IUser;
        return verify(password, self.password);
    }
}

export default model(User);