import mongoose from 'mongoose';
import crypto from 'crypto';
import { isNullOrUndefined } from 'util';
import moment from 'moment';
import { serializeError } from 'serialize-error';
import IUser from '../interfaces/IUser';
import { isFilled, isQueryParamFilled } from '../common/Utils';
import { Response, Request } from 'express';
import { v1 as uuidv1 } from 'uuid';
import ExpressRequest from '../core/interfaces/express/ExpressRequest';
import User from '../models/User';
import HttpStatus from '../common/HttpStatus';
import socketIoServer from '../config/socket.io/socket.io.server';
import userProvider from '../providers/user.provider';
import ICountry from '../interfaces/ICountry';
import ICurrency from '../interfaces/ICurrency';
import BalanceMovement from '../models/BalanceMovement';
import IBalanceMovement from '../interfaces/IBalanceMovement';

/**
 * Manage user
 */
class UserController {

    /**
     * Get all users
     * @param req request
     * @param res response
     */
    async all(req: Request, res: Response) {
        //query data
        const queryData: any[string] = [];

        // username
        if (isQueryParamFilled(req.query.username)) {
            queryData['username'] = { $regex: `.*${req.query.username}.*` };
        }

        // phoneNumber
        if (isQueryParamFilled(req.query.phoneNumber)) {
            queryData['phoneNumber'] = { $regex: `.*${req.query.phoneNumber}.*` };
        }

        await User.paginate({ ...queryData }, {
            page: parseInt(req.query.page || 1),
            limit: parseInt(req.query.limit || 20),
            sort: { createdAt: 'desc' }
        }).then(function (data) {
            res.status(HttpStatus.Ok).json(data);
        }).catch(function (err) {
            res.status(HttpStatus.InternalServerError).json(serializeError(err));
        })
    }

    /**
     * Get user's balance movements
     * @param req request
     * @param res response
     */
    async balanceMovements(req: Request, res: Response) {
        //query data
        const queryData: any[string] = [];

        // movement type
        if (!isNullOrUndefined(req.query.type) && ['cash-in', 'cash-out'].includes(req.query.type)) {
            switch (req.query.type) {
                case 'cash-out':
                    queryData['amount'] = { $lt: 0 };
                    break;
                case 'cash-in':
                    queryData['amount'] = { $gt: 0 };
                    break;
            }
        }

        // start date
        if (!isNullOrUndefined(req.query.startDate) && `${req.query.startDate}`.length != 0) {
            const startDate = moment(req.query.startDate);
            if (startDate.isValid()) {
                queryData['createdAt'] = {
                    $gt: startDate
                };
            }
        }

        // end date
        if (!isNullOrUndefined(req.query.endDate) && `${req.query.endDate}`.length != 0) {
            const endDate = moment(req.query.endDate);
            if (endDate.isValid()) {
                queryData['createdAt'] = {
                    $lt: endDate
                };
            }
        }

        await BalanceMovement.paginate({ user: req.params.id }, {
            page: parseInt(req.query.page || 1),
            limit: parseInt(req.query.limit || 20),
            sort: { createdAt: 'desc' }
        }).then(data => {
            res.status(HttpStatus.Ok).json(data);
        }).catch((err: any) => {
            res.status(HttpStatus.InternalServerError).json(serializeError(err));
        })
    }

    /**
     * Edit user locked state
     * @param req request
     * @param res response
     */
    async editLockedState(req: Request, res: Response) {
        try {
            // load user
            const user = await User.findById(req.params.id);

            if (user) {

                /**
                 * Check if locked param exist in request body
                 */
                if (isNullOrUndefined(req.body.locked)) {
                    throw {
                        message: 'Locked is required!'
                    };
                }

                // update state
                user.lockedAt = req.body.locked ? new Date() : undefined;

                //save changes
                await user.save();

                return res.status(HttpStatus.Ok).send();
            } else {
                return res.status(HttpStatus.NotFound).send();
            }
        } catch (e) {
            res.status(HttpStatus.InternalServerError).json(serializeError(e));
        }
    }

    /**
     * Get online users count
     * 
     * @param req request
     * @param res response
     */
    async onlineUsers(req: Request, res: Response) {
        socketIoServer.io().clients(function (error: any, clients: any[]) {
            // send the result to the
            res.status(HttpStatus.Ok).json({
                count: clients.length
            });
        });
    }

    /**
     * Get connected users count
     * 
     * @param req request
     * @param res response
     */
    async connectedUsers(req: Request, res: Response) {
        const onlineUsersCount = await User.countDocuments({ online: true });
        res.status(HttpStatus.Ok).json({
            count: onlineUsersCount
        });
    }

    /**
     * Get user details
     * 
     * @param req request
     * @param res response
     */
    async show(req: Request, res: Response) {
        try {
            // load user
            const user = await userProvider.loadFullUser({ _id: req.params.id });
            if (user) {
                res.status(HttpStatus.Ok).json(user);
            } else {
                res.status(HttpStatus.NotFound).json();
            }
        } catch (error) {
            res.status(HttpStatus.InternalServerError).json(serializeError(error));
        }
    }

    /**
     * Profile updated
     * @param req request
     * @param res response
     */
    async profile(req: Request, res: Response) {
        try {
            // load user
            const user = await userProvider.loadFullUser({ _id: req.params.id });

            // total deposits


            // total expenses


            if (user) {
                res.status(HttpStatus.Ok).json({
                    user,
                    deposits: 0,
                    expenses: 0
                });
            } else {
                res.status(HttpStatus.NotFound).json();
            }
        } catch (error) {
            res.status(HttpStatus.InternalServerError).json(serializeError(error));
        }
    }

    /**
     * Get the current user details
     * 
     * @param req request
     * @param res response
     */
    async currentUser(req: Request, res: Response) {
        const request = req as ExpressRequest;
        try {
            // load user
            const user = await userProvider.loadFullUser({ _id: request.user._id });
            if (user) {
                res.status(HttpStatus.Ok).json(user);
            } else {
                res.status(HttpStatus.NotFound).json();
            }
        } catch (error) {
            res.status(HttpStatus.InternalServerError).json(serializeError(error));
        }
    }

    /**
     * Subscribe to OneSignal push notification system
     * @param req request
     * @param res response
     */
    async subscribeToOneSignalPushNotification(req: Request, res: Response) {
        const request = req as ExpressRequest;

        // load user
        const user = request.user as IUser;

        // update current user
        await User.updateOne({ _id: user._id }, {
            $set: {
                oneSignalUserId: req.body.oneSignalUserId
            }
        }, { runValidators: true })

        res.status(HttpStatus.Ok).send()

        return;
    }

    /**
     * Unsubscribe to OneSignal push notification system
     * @param req request
     * @param res response
     */
    async unsubscribeToOneSignalPushNotification(req: Request, res: Response) {
        const request = req as ExpressRequest;

        // load user
        const user = request.user as IUser;

        // update current user
        await User.updateOne({ _id: user._id }, {
            $set: {
                oneSignalUserId: null
            }
        }, { runValidators: true })

        res.status(HttpStatus.Ok).send()

        return;
    }

    /**
     * Unsubscribte all user with the given OneSignal userId
     * @param req request
     * @param res response
     */
    async unsubscribeOneSignalUserId(req: Request, res: Response) {
        await User.updateMany({ oneSignalUserId: req.params.userId }, {
            $set: {
                oneSignalUserId: null
            }
        })

        return res.status(HttpStatus.Ok).send()
    }

    /**
     * Make custom financial movement on specific user account
     * 
     * @param req request
     * @param res response
     */
    async customAccountMovement(req: Request, res: Response) {
        // custom request
        const request = req as ExpressRequest;

        // current user
        const currentUser = request.user as IUser;

        // create mongoose session
        const session = await mongoose.startSession()
        session.startTransaction()

        try {
            // load user
            const user = await userProvider.loadFullUser({ _id: req.params.id }, session);

            if (!user) {
                throw {
                    message: 'Unknown user.'
                }
            }

            // amount
            const amount = req.body.amount;
            const fictional = req.body.fictional;
            const deposit = req.body.deposit;

            // checking amount
            if (!isFilled(amount) || amount === 0) {
                throw {
                    status: HttpStatus.BadRequest,
                    message: 'Amount is required and must be greater than 0.'
                }
                return;
            }

            // checking deposit
            if (!isFilled(deposit)) {
                throw {
                    status: HttpStatus.BadRequest,
                    message: 'Deposit is required.'
                }
                return;
            }

            // checking currency
            if (!isFilled(fictional)) {
                throw {
                    status: HttpStatus.BadRequest,
                    message: 'Currency is required.'
                }
                return;
            }

            if (deposit === true) {
                // update balance
                if (fictional === true) {
                    user.fictionalBalance += amount;
                } else {
                    user.realBalance += amount;
                }

                // create movement
                const balanceMovement = new BalanceMovement({
                    doneBy: currentUser._id,
                    user: user._id,
                    note: `Custom addition of ${amount} ${((user.country as ICountry).currency as ICurrency).code}`,
                    amount: Math.abs(amount),
                    fictional
                } as Partial<IBalanceMovement>);

                // save change
                await balanceMovement.save({ session })

                // save user change
                await user.save({ session })

                await session.commitTransaction()
                session.endSession()
            }

            if (deposit === false) {
                // update balance
                if (fictional === false) {
                    user.fictionalBalance -= amount;
                } else {
                    user.realBalance -= amount;
                }

                // create movement
                const balanceMovement = new BalanceMovement({
                    doneBy: currentUser._id,
                    user: user._id,
                    note: `Custom substraction of ${amount} ${((user.country as ICountry).currency as ICurrency).code}`,
                    amount: -1 * Math.abs(amount),
                    fictional
                } as Partial<IBalanceMovement>);

                // save change
                await balanceMovement.save({ session })

                // save user change
                await user.save({ session })

                await session.commitTransaction()
                session.endSession()
            }

            return res.status(HttpStatus.Ok).json(user)

        } catch (error) {
            await session.abortTransaction()
            session.endSession()

            return res.status(error.status || HttpStatus.InternalServerError).json(serializeError(error))
        }
    }

    /**
     * Delete user account
     * @param req request
     * @param res response
     */
    async delete(req: Request, res: Response) {
        const request = req as ExpressRequest;

        try {
            const session = await mongoose.startSession()
            session.startTransaction()

            try {
                // update space
                await User.updateOne({ _id: request.user._id }, {
                    username: `DELETED-${request.user.username}-${uuidv1()}`,
                    phoneNumber: `DELETED-${request.user.phoneNumber}-${uuidv1()}`,
                    deletedAt: new Date()
                } as Partial<IUser>, { runValidators: true })

                return res.status(HttpStatus.Ok).send()
            } catch (e) {
                await session.abortTransaction()
                session.endSession()

                throw e
            }
        } catch (error) {
            return res.status(error.status || 500).json(serializeError(error))
        }
    }
}

export default new UserController() as UserController;