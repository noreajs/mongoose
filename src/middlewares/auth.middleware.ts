import * as jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { serializeError } from 'serialize-error';
import requestIp from 'request-ip';
import { verify } from "unixcrypt"
import ExpressRequest  from '../core/interfaces/express/ExpressRequest';
import User from '../models/User';
import userProvider from '../providers/user.provider';
import { isFilled } from '../common/Utils';
import HttpStatus from '../common/HttpStatus';
import ipGeoApiProvider from '../providers/ip-geo-api.provider';
import IJWTData from '../interfaces/IJWTData';
import { DEVICE_UNIQUE_ID_HEADER } from '../interfaces/CONST';

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

                    // check device unique id
                    if (jwtCredentials.deviceUniqueId === req.get(DEVICE_UNIQUE_ID_HEADER)) {
                        const user = await userProvider.loadFullUser({ phoneNumber: jwtCredentials.sub });
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
                    } else {
                        return res.status(HttpStatus.Unauthorized).json({
                            message: 'Whhhat?!!...Corrupted token?! Unknown device ID?! How do you get this token please?!! ... are you kidding?!  Be careful sir..... oooooooh yes be careful!!!'
                        })
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
     * Get country information from client 
     * @param req request
     * @param res response
     * @param next next action callback
     */
    async clientIpCountryLookup(req: Request, res: Response, next: NextFunction) {
        const ip = requestIp.getClientIp(req);
        if (ip) {
            const request = req as ExpressRequest;
            const lookup = await ipGeoApiProvider.ipLookup(ip);
            if (lookup) {
                request.countryLookup = lookup;
                return next();
            } else {
                return res.status(HttpStatus.ExpectationFailed).json({
                    status: 400,
                    message: 'Unable get client ip address.'
                })
            }

        } else {
            return res.status(HttpStatus.BadRequest).json({
                status: 400,
                message: 'Unable get client ip address.'
            })
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
            phoneNumber: req.body.phoneNumber,
            $or: [
                { deletedAt: { $exists: false } },
                { deletedAt: { $eq: null } }
            ]
        }).then((user) => {
            if (user) {
                if (verify(req.body.secretCode, user.secretCode)) {
                    return next();
                } else {
                    return res.status(HttpStatus.BadRequest).json({
                        message: "Check your credentials"
                    });
                }
            } else {
                return res.status(HttpStatus.BadRequest).json({
                    message: `No account associated with the phone number ${req.body.phoneNumber}`
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
    async secretCodeRequired(req: Request, res: Response, next: NextFunction) {
        const request = req as ExpressRequest;
        // load user
        const user = request.user;

        // secret code required
        if (!isFilled(req.body.secretCode)) {
            return res.status(HttpStatus.BadRequest).json({
                message: "The secret code is required for this request."
            });
        }
        // check the user secret code
        else if (verify(req.body.secretCode, user.secretCode)) {
            return next();
        } else {
            return res.status(HttpStatus.Forbidden).json({
                message: "The given secret code is not correct."
            });
        }
    }

    /**
     * Check if the current user has a verified phone number
     * @param req request
     * @param res response
     * @param next request chain
     */
    async phoneNumberVerified(req: Request, res: Response, next: NextFunction) {
        const request = req as ExpressRequest;
        if (!request.user.phoneNumberVerification || request.user.phoneNumberVerification.status !== "approved") {
            return res.status(403).json({
                message: 'Verify your phone number before performing this action.'
            })
        } else {
            return next()
        }
    }

    /**
     * Check if device unique id header is provided
     * @param req request
     * @param res response
     * @param next request chain
     */
    async deviceUniqueIdRequired(req: Request, res: Response, next: NextFunction) {
        // checking device unique id header
        if (req.get(DEVICE_UNIQUE_ID_HEADER)) {
            return next();
        } else {
            return res.status(403).json({
                message: 'Device unique ID header param is required.'
            })
        }
    }
}

export default new AuthMiddleware() as AuthMiddleware;