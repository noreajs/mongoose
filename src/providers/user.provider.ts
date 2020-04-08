import { ClientSession } from 'mongoose';
import User from '../models/User';
import IUser from '../interfaces/IUser';

class UserProvider {
    /**
     * Load user by id and populate all related data
     * @param query data to by matched
     * @param userId user id
     * @param session mongoose client session
     */
    async loadFullUser(query: Partial<IUser>, session?: ClientSession) {
        // populate array
        const populateArray = [
            {
                path: 'country',
                populate: {
                    path: 'currency'
                }
            },
            {
                path: 'currency'
            },
            {
                path: 'phoneNumberVerification'
            }
        ];

        // check session
        if (session) {
            return await User.findOne(query).populate(populateArray);
        } else {
            return await User.findOne(query).populate(populateArray);
        }
    }
}

export default new UserProvider() as UserProvider;