import authMiddleware from "../middlewares/auth.middleware"
import { Application } from "express"
import userController from "../controllers/user.controller"

export default (app: Application) => {

    /**
     * Get online users count
     */
    app.route('/realtime/count/online-users').get(userController.onlineUsers)

    /**
     * Get connected users count
     */
    app.route('/realtime/count/connected-users').get(userController.connectedUsers)

    /**
     * Get user lists
     */
    app.route('/users').get([
        authMiddleware.validJwtNeeded,
        authMiddleware.adminOnly,
        userController.all
    ])

    /**
     * update user lock state (locked or unlocked)
     */
    app.route('/users/:id/lock-state').put([
        authMiddleware.validJwtNeeded,
        authMiddleware.adminOnly,
        userController.editLockedState
    ])

    /**
     * Show user
     */
    app.route('/users/:id').get([
        authMiddleware.validJwtNeeded,
        authMiddleware.adminOnly,
        userController.show
    ])

    /**
     * Edit user
     */
    app.route('/users/:id').put([
        authMiddleware.validJwtNeeded,
        authMiddleware.adminOnly,
        // userController.edit
    ])

    /**
     * Get the current user details
     */
    app.route('/current-user').get([
        authMiddleware.validJwtNeeded,
        userController.currentUser
    ])

    /**
     * Delete user account
     */
    app.route('/users/:id').delete([
        authMiddleware.validJwtNeeded,
        userController.delete
    ])
}