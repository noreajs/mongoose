import { Document, ClientSession } from "mongoose";

export default interface IUser extends Document {
    profilePicture?: string;
    password: string;
    username: string;
    admin: boolean;
    online: boolean;
    socketId: string;
    email: string,
    emailVerifiedAt?: Date;
    locale: string;
    createdAt: Date;
    updatedAt?: Date;
    deletedAt?: Date;
    lockedAt?: Date;
    setPassword: (password: string) => void
    verifyPassword: (password: string) => boolean
}