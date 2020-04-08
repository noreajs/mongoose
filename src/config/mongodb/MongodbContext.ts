import mongoose from 'mongoose';
import SyncIndexes from './SyncIndexes';


class MongoContext {
    
    /**
     * Initialize mongodb connection
     */
    async init(): Promise<void> {
        // listen connection
        const db = mongoose.connection;
        db.on('error', console.error.bind(console, 'connection error:'));
        db.once('open', function () {
            console.log("we're connected on mongoDB!!");

            // synchronize models
            SyncIndexes()
        });

        // trigger connection
        await mongoose.connect(`${process.env.MONGODB_URI}`, {
            useCreateIndex: true,
            useNewUrlParser: true,
            useFindAndModify: false,
            useUnifiedTopology: true 
        });
        
        // load mongoose paginate
        var mongoosePaginate = require('mongoose-paginate');
        // set mongooPaginate default options
        mongoosePaginate.paginate.options = {
            lean: true,
            leanWithId: true
        };
    }
}

export default new MongoContext();