import { Application } from "express"
import authController from "../controllers/auth.controller"
import authMiddleware from "../middlewares/auth.middleware"

export default (app: Application) => {
    /**
     * Register
     */
    app.route('/register').post([
        authController.register
    ])

    /**
     * login
     */
    app.route('/login').post([
        authController.login
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
        authController.updateAccount
    ])

}