import * as jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { serializeError } from 'serialize-error';
import { verify } from "unixcrypt"
import ExpressRequest  from '../core/interfaces/express/ExpressRequest';
import User from '../models/User';
import userProvider from '../providers/user.provider';
import { isFilled } from '../common/Utils';
import HttpStatus from '../common/HttpStatus';
import IJWTData from '../interfaces/IJWTData';

class AuthMiddleware {
    /**
     * Only authentificated url will be excecuted.
     * 
     * @param req request
     * @param res response
     * @param next 
     */
    async validJwtNeeded(req: Request, res: Response, next: NextFunction) {
        const authorizationHeader = req.headers['authorization'];
        if (authorizationHeader) {
            try {
                let authorization = authorizationHeader.split(' ');
                if (authorization[0] !== 'Bearer') {
                    return res.status(HttpStatus.Unauthorized).send();
                } else {
                    const jwtCredentials: IJWTData = jwt.verify(authorization[1], `${process.env.JWT_SECRET_KEY}`) as IJWTData;

                    const user = await userProvider.loadFullUser({ email: jwtCredentials.sub });
                        if (user) {
                            if (user.lockedAt) {
                                return res.status(HttpStatus.Unauthorized).json({
                                    message: `Your account has been blocked. Contact technical support.`
                                });
                            } if (user.deletedAt) {
                                return res.status(HttpStatus.Unauthorized).send();
                            } else {
                                // set the request user
                                const request = req as ExpressRequest;
                                request.user = user;

                                return next();
                            }
                        } else {
                            return res.status(HttpStatus.Unauthorized).json({
                                message: `Unknown account?? Corrupted token! be careful sir... ooooooh yes be careful!`
                            });
                        }
                }
            } catch (err) {
                return res.status(HttpStatus.Unauthorized).send();
            }
        } else {
            return res.status(HttpStatus.Unauthorized).send();
        }
    }

    /**
     * Only administrator can access to the resource
     * 
     * @param req 
     * @param res 
     * @param next 
     */
    adminOnly(req: Request, res: Response, next: NextFunction) {
        const request = req as ExpressRequest;
        if (request.user.admin) {
            return next();
        } else {
            return res.status(HttpStatus.Forbidden).send({
                message: 'Admin only can access to this route.'
            });
        }
    }

    /**
     * Check the user credentials
     * 
     * @param req 
     * @param res 
     * @param next 
     */
    async isSecretCodeAndUserMatch(req: Request, res: Response, next: NextFunction) {
        await User.findOne({
            email: req.body.email,
            $or: [
                { deletedAt: { $exists: false } },
                { deletedAt: { $eq: null } }
            ]
        }).then((user) => {
            if (user) {
                if (verify(req.body.password, user.password)) {
                    return next();
                } else {
                    return res.status(HttpStatus.BadRequest).json({
                        message: "Check your credentials"
                    });
                }
            } else {
                return res.status(HttpStatus.BadRequest).json({
                    message: `No account associated with the email ${req.body.email}`
                });
            }
        }).catch((error) => {
            return res.status(HttpStatus.InternalServerError).json({
                message: `Internal problem. Contact support`,
                error: serializeError(error)
            });
        });
    }

    /**
     * Check user secret code in request
     * Always used after validJwtNeeded method
     * 
     * @param req request
     * @param res response
     * @param next request chain
     */
    async passwordRequired(req: Request, res: Response, next: NextFunction) {
        const request = req as ExpressRequest;
        // load user
        const user = request.user;

        // secret code required
        if (!isFilled(req.body.password)) {
            return res.status(HttpStatus.BadRequest).json({
                message: "The secret code is required for this request."
            });
        }
        // check the user secret code
        else if (verify(req.body.password, user.password)) {
            return next();
        } else {
            return res.status(HttpStatus.Forbidden).json({
                message: "The given secret code is not correct."
            });
        }
    }

    /**
     * Check if the current user has a verified email
     * @param req request
     * @param res response
     * @param next request chain
     */
    async emailVerified(req: Request, res: Response, next: NextFunction) {
        const request = req as ExpressRequest;
        if (!request.user.emailVerifiedAt) {
            return res.status(403).json({
                message: 'Verify your email before performing this action.'
            })
        } else {
            return next()
        }
    }
}

export default new AuthMiddleware() as AuthMiddleware;