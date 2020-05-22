import { NoreaApp } from "@noreajs/core"
import apiRoutes from "./api.routes"


/**
 * Create a new NoreaJs App
 */
const app = new NoreaApp(apiRoutes, {
    forceHttps: false,
    beforeStart: (app) => { },
    afterStart: (app, server, port) => {
        console.log('@noreajs/mongoose test server'),
        console.log('The api is running on port', port)
    }
})

/**
 * Start your app
 */
app.start(3000)