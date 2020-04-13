import { Request } from "express";
import IUser from "../../../interfaces/IUser";


export default interface ExpressRequest extends Request<any> {
    user: IUser
}