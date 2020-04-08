import { Application } from "express"
import authController from "../controllers/auth.controller"
import authMiddleware from "../middlewares/auth.middleware"

export default (app: Application) => {
    /**
     * Switch app mode
     */
    app.route('/app/mode').put([
        authMiddleware.validJwtNeeded,
        authMiddleware.adminOnly,
        authController.switchMode
    ])

    /**
     * Register
     */
    app.route('/register').post([
        authMiddleware.deviceUniqueIdRequired,
        authMiddleware.clientIpCountryLookup,
        authController.register
    ])

    /**
     * login
     */
    app.route('/login').post([
        authMiddleware.deviceUniqueIdRequired,
        authMiddleware.clientIpCountryLookup,
        authController.login
    ])

    /**
     * Update user's secret code
     */
    app.route('/account/update/secret-code').put([
        authMiddleware.validJwtNeeded,
        authMiddleware.secretCodeRequired,
        authController.updateSecretCode
    ])

    /**
     * Update account locale
     */
    app.route('/account/update/locale').put([
        authMiddleware.validJwtNeeded,
        authController.updateLocale
    ])

    /**
     * Update account
     */
    app.route('/account/update').put([
        authMiddleware.validJwtNeeded,
        authMiddleware.secretCodeRequired,
        authController.updateAccount
    ])

    /**
     * Reset secret code
     */
    app.route('/acount/reset-secret-code').post([
        authController.resetSecretCode
    ])
}