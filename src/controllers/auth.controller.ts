import { Request, Response } from "express";
import mongoose from 'mongoose';
import jwt from "jsonwebtoken";
import User from "../models/User";
import { serializeError } from "serialize-error";
import IUserResponse from "../interfaces/IUserResponse";
import HttpStatus from "../common/HttpStatus";
import IUser from "../interfaces/IUser";
import IJWTData from "../interfaces/IJWTData";
import ExpressRequest from "../core/interfaces/express/ExpressRequest";
import Country from "../models/Country";
import { DEVICE_UNIQUE_ID_HEADER } from "../interfaces/CONST";
import userProvider from "../providers/user.provider";
import ICountry from "../interfaces/ICountry";
import Currency from "../models/Currency";
import twilioService from '../services/twilio.service';
import { PhoneNumberUtil, PhoneNumberFormat } from "google-libphonenumber";
import validator from "validator";
import { isFilled, isLocaleValid } from "../common/Utils";
import authNotification from "../notifications/auth.notification";

class AuthController {
    /**
     * Register a user
     * @param request request
     * @param response response
     */
    async register(request: Request, response: Response) {
        const req = request as ExpressRequest;
        try {
            // load country
            const country = await Country.findOne({ alpha2Code: req.countryLookup.alpha2Code })

            if (country) {
                if (country.authorized) {
                    if (`${request.body.secretCode}`.length != 6) {
                        throw {
                            status: HttpStatus.BadRequest,
                            message: 'The secret code length is 6'
                        }
                    } else if (!validator.isNumeric(request.body.secretCode)) {
                        throw {
                            status: HttpStatus.BadRequest,
                            message: 'The secret code must be a number'
                        }
                    }

                    let user = new User({
                        username: request.body.username,
                        email: request.body.email,
                        phoneNumber: request.body.phoneNumber,
                        country: country._id,
                        currency: (await Currency.findOne({ code: 'USD' }))?._id,
                        locale: request.headers['accept-language'],
                        region: req.countryLookup.region,
                        city: req.countryLookup.city
                    } as Partial<IUser>);

                    // set secret code
                    user.setSecretCode(request.body.secretCode)

                    await user.save();

                    const accessToken = jwt.sign(
                        {
                            id: user.id,
                            sub: user.phoneNumber,
                            deviceUniqueId: request.get(DEVICE_UNIQUE_ID_HEADER),
                            iss: `${process.env.JWT_TOKEN_ISSUER}`,
                            countryAlpha2Code: req.countryLookup.alpha2Code
                        } as IJWTData,
                        `${process.env.JWT_SECRET_KEY}`,
                        { expiresIn: Number(process.env.JWT_TOKEN_EXPIRES_IN) }
                    );

                    return response.status(HttpStatus.Created).send({ user: (await userProvider.loadFullUser({ _id: user._id })) as IUser, accessToken: accessToken, expiresIn: `${process.env.JWT_TOKEN_EXPIRES_IN}` } as IUserResponse);
                } else {
                    return response.status(HttpStatus.Forbidden).json({
                        message: `This service is not or no longer available in ${country.name}. Sorry for the inconvenience.`
                    })
                }
            } else {
                return response.status(HttpStatus.Forbidden).json({
                    message: `The service is not yet available in ${req.countryLookup.name}. Contact support for more information.`
                })
            }
        } catch (error) {
            return response.status(HttpStatus.InternalServerError).json(serializeError(error))
        }
    }

    /**
     * User login
     * @param request request
     * @param response response
     */
    async login(request: Request, response: Response) {
        const req = request as ExpressRequest;
        const secretCode = request.body.secretCode;

        try {
            // load user
            const user = await userProvider.loadFullUser({ "phoneNumber": request.body.phoneNumber });

            if (!user) {
                return response.status(HttpStatus.BadRequest).send({
                    message: 'Unknow user, check your credentials please.'
                })
            } else {
                // user country
                const country = user.country as ICountry;
                if (country.alpha2Code === req.countryLookup.alpha2Code) {
                    const result = user.verifySecretCode(secretCode)

                    if (!result) return response.status(HttpStatus.BadRequest).send({
                        message: 'Check your credentials please.'
                    })

                    const accessToken = jwt.sign(
                        {
                            id: user.id,
                            sub: user.phoneNumber,
                            deviceUniqueId: request.get(DEVICE_UNIQUE_ID_HEADER),
                            iss: `${process.env.JWT_TOKEN_ISSUER}`,
                            countryAlpha2Code: req.countryLookup.alpha2Code
                        } as IJWTData,
                        `${process.env.JWT_SECRET_KEY}`,
                        { expiresIn: Number(process.env.JWT_TOKEN_EXPIRES_IN) }
                    );
                    return response.status(HttpStatus.Ok).send({ user: user, accessToken: accessToken, expiresIn: `${process.env.JWT_TOKEN_EXPIRES_IN}` } as IUserResponse);
                } else {
                    return response.status(HttpStatus.Unauthorized).json({
                        message: `You are trying to access your account from ${req.countryLookup.name}, which is not allowed since your account was created in ${country.name}. If you change the country, create a new account and contact the support for the balance of the old account.`
                    })
                }
            }
        } catch (error) {
            return response.status(HttpStatus.InternalServerError).send(serializeError(error));
        }
    }

    /**
     * Update secret code
     * @param req request
     * @param res response
     */
    async updateSecretCode(req: Request, res: Response) {
        try {
            const request = req as ExpressRequest;
            // load user
            const user = request.user;
            // set changes
            user.setSecretCode(request.body.newSecretCode)
            // save changes
            await user.save();

            return res.status(HttpStatus.Ok).json(user);
        } catch (error) {
            return res.status(HttpStatus.InternalServerError).json(serializeError(error));
        }
    }

    /**
     * Update secret code
     * @param req request
     * @param res response
     */
    async updateLocale(req: Request, res: Response) {
        try {
            const request = req as ExpressRequest;
            // check locale validity
            if (!isFilled(request.body.locale)) {
                throw {
                    status: HttpStatus.BadRequest,
                    message: 'The locale is required'
                }
            } else if (!isLocaleValid(request.body.locale)) {
                throw {
                    status: HttpStatus.BadRequest,
                    message: `The format of the given locale (${request.body.locale}) is not correct. Expected example: en-US, fr-FR`
                }
            }
            // load user
            const user = request.user;
            // set changes
            user.set({
                locale: request.body.locale
            } as Partial<IUser>);
            // save changes
            await user.save();

            return res.status(HttpStatus.Ok).json(user);
        } catch (error) {
            return res.status(HttpStatus.InternalServerError).json(serializeError(error));
        }
    }

    /**
     * Update account (phone number and username only)
     * @param req request
     * @param res response
     */
    async updateAccount(req: Request, res: Response) {
        const session = await mongoose.startSession()
        session.startTransaction();

        try {
            const request = req as ExpressRequest;
            // load user
            const user = request.user;
            // last phone number
            const lastPhoneNumber = user.phoneNumber;
            // set changes
            user.set({
                username: req.body.username || user.username,
                phoneNumber: req.body.phoneNumber || user.phoneNumber,
                email: req.body.email || user.email,
                region: req.body.region || user.region,
                city: req.body.city || user.city,
                postalCode: req.body.postalCode || user.postalCode,
                address: req.body.address || user.address,
                birth: req.body.birth || user.birth,
                gender: req.body.gender || user.gender
            } as IUser)
            // save changes
            await user.save({ session });

            /**
             * If the phone number changed
             */
            if (lastPhoneNumber !== user.phoneNumber) {
                // delete verification state
                user.phoneNumberVerification = undefined;
                // save changes
                await user.save({ session });
            }

            await session.commitTransaction()
            session.endSession()

            return res.status(HttpStatus.Ok).json(user);
        } catch (error) {
            await session.abortTransaction()
            session.endSession()

            return res.status(HttpStatus.InternalServerError).json(serializeError(error));
        }
    }

    /**
     * Reset the secret code of the given phone number
     * @param req request
     * @param res response
     */
    async resetSecretCode(req: Request, res: Response) {
        const session = await mongoose.startSession()
        session.startTransaction()

        try {
            // load user
            const user = await userProvider.loadFullUser({ phoneNumber: req.body.phoneNumber }, session)

            if (user) {
                // new code
                const max = 999999, min = 100000;
                const newSecretCode = Math.round((Math.random() * (max - min)) + min);

                user.setSecretCode(newSecretCode.toString())

                await user.save({ session })

                // notify user
                await authNotification.push.sendSecretCode(user._id, newSecretCode.toString(), session)

                // check attemps
                if (user.secretCodeResetAttemps <= Number(`${process.env.SECRET_CODE_RESET_LIMIT}`)) {
                    const phoneUtil = PhoneNumberUtil.getInstance();
                    const number = phoneUtil.parse(user.phoneNumber, (user.country as ICountry).alpha2Code);
                    const e164PhoneNumber = phoneUtil.format(number, PhoneNumberFormat.E164);

                    // send the new secret code by SMS
                    await twilioService.client().messages.create({
                        messagingServiceSid: `${process.env.TWILIO_MESSAGING_SERVICE_SID}`,
                        body: `Your new secret code is ${newSecretCode}. Please change it as soon as possible.`,
                        from: `${process.env.TWILIO_PHONE_NUMBER}`,
                        to: e164PhoneNumber
                    }).then(async (response) => {
                        // update attemps
                        user.set({ secretCodeResetAttemps: (user.secretCodeResetAttemps || 5) + 1 } as Partial<IUser>)
                        // save changes
                        await user.save({ session })
                    }).catch((reason: any) => {
                        throw reason
                    })
                }

                await session.commitTransaction()
                session.endSession()

                return res.status(HttpStatus.Ok).send()
            } else {
                throw {
                    status: HttpStatus.NotFound,
                    message: 'There is not account related to this number.'
                }
            }
        } catch (error) {
            await session.abortTransaction()
            session.endSession()

            return res.status(error.status || HttpStatus.InternalServerError).json(serializeError(error));
        }
    }

    /**
     * Switch app mode
     * @param req request
     * @param res response
     */
    async switchMode(req: Request, res: Response) {
        try {
            if (!isFilled(req.body.testMode)) {
                throw {
                    status: HttpStatus.BadRequest,
                    message: '"testMode" field is required.'
                }
            }

            await User.updateMany({
                deletedAt: { $exists: false },
            }, {
                testMode: req.body.testMode
            })

            return res.status(HttpStatus.Ok).send()
        } catch (error) {
            return res.status(error.status || HttpStatus.InternalServerError).json(serializeError(error))
        }
    }
}

export default new AuthController()