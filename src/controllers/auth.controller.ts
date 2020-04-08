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
import userProvider from "../providers/user.provider";
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
            let user = new User({
                username: request.body.username,
                email: request.body.email,
                locale: request.headers['accept-language'],
            } as Partial<IUser>);

            // set secret code
            user.setPassword(request.body.password)

            await user.save();

            const accessToken = jwt.sign(
                {
                    id: user.id,
                    sub: user.email,
                    iss: `${process.env.JWT_TOKEN_ISSUER}`
                } as IJWTData,
                `${process.env.JWT_SECRET_KEY}`,
                { expiresIn: Number(process.env.JWT_TOKEN_EXPIRES_IN) }
            );

            return response.status(HttpStatus.Created).send({
                user: (await userProvider.loadFullUser({ _id: user._id })) as IUser,
                accessToken: accessToken,
                expiresIn: `${process.env.JWT_TOKEN_EXPIRES_IN}`
            } as IUserResponse);
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
        const password = request.body.password;

        try {
            // load user
            const user = await userProvider.loadFullUser({ "email": request.body.email });

            if (!user) {
                return response.status(HttpStatus.BadRequest).send({
                    message: 'Unknow user, check your credentials please.'
                })
            } else {
                const result = user.verifyPassword(password)

                if (!result) return response.status(HttpStatus.BadRequest).send({
                    message: 'Check your credentials please.'
                })

                const accessToken = jwt.sign(
                    {
                        id: user.id,
                        sub: user.email,
                        iss: `${process.env.JWT_TOKEN_ISSUER}`
                    } as IJWTData,
                    `${process.env.JWT_SECRET_KEY}`,
                    { expiresIn: Number(process.env.JWT_TOKEN_EXPIRES_IN) }
                );
                return response.status(HttpStatus.Ok).send({
                    user: user,
                    accessToken: accessToken,
                    expiresIn: `${process.env.JWT_TOKEN_EXPIRES_IN}`
                } as IUserResponse);
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
    async updatePassword(req: Request, res: Response) {
        try {
            const request = req as ExpressRequest;
            // load user
            const user = request.user;
            // set changes
            user.setPassword(request.body.newPassword)
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
            const lastEmail = user.email;
            // set changes
            user.set({
                username: req.body.username || user.username,
                email: req.body.email || user.email
            } as IUser)
            // save changes
            await user.save({ session });

            /**
             * If the phone number changed
             */
            if (lastEmail !== user.email) {
                // delete verification state
                user.emailVerifiedAt = undefined;
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
    async resetPassword(req: Request, res: Response) {
        const session = await mongoose.startSession()
        session.startTransaction()

        try {
            // load user
            const user = await userProvider.loadFullUser({ email: req.body.email }, session)

            if (user) {
                //
                // your code here
                //
                
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
}

export default new AuthController()