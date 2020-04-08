import { Request } from "express";
import IUser from "../../../interfaces/IUser";
import ICountryIpLookup from "../../../interfaces/ICountryIpLookup";


export default interface ExpressRequest extends Request<any> {
    user: IUser,
    countryLookup: ICountryIpLookup
}