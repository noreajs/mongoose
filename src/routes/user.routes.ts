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
     * User's balance movements
     */
    app.route('/users/:id/balance-movements').get([
        authMiddleware.validJwtNeeded,
        userController.balanceMovements
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
     * Profile
     */
    app.route('users/:id/profile').get([
        authMiddleware.validJwtNeeded,
        userController.profile
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
     * Subscribe to OneSignal push notification system
     */
    app.route('/one-signal/push/subscribe').post([
        authMiddleware.validJwtNeeded,
        userController.subscribeToOneSignalPushNotification
    ])

    /**
     * Unsubscribe to OneSignal push notification system
     */
    app.route('/one-signal/push/unsubscribe').post([
        authMiddleware.validJwtNeeded,
        userController.unsubscribeToOneSignalPushNotification
    ])

    /**
     * Unsubscribe to OneSignal push notification system
     */
    app.route('/one-signal/push/unsubscribe/:userId').post([
        authMiddleware.validJwtNeeded,
        userController.unsubscribeOneSignalUserId
    ])

    /**
     * Make custom financial movement on specific user account
     */
    app.route('/users/:id/custom-account-movement').post([
        authMiddleware.validJwtNeeded,
        authMiddleware.adminOnly,
        authMiddleware.secretCodeRequired,
        userController.customAccountMovement
    ])

    /**
     * Delete user account
     */
    app.route('/users/:id').delete([
        authMiddleware.validJwtNeeded,
        authMiddleware.secretCodeRequired,
        userController.delete
    ])
}