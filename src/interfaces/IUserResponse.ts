import IUser from "./IUser";

export default interface IUserResponse {
    user: IUser,
    accessToken: string,
    expiresIn: string
}