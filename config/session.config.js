const MongoStore = require('connect-mongo');
const session = require('express-session');

module.exports = app => {
    app.set('trust proxy',1);

    //use session
    app.use(
        session({
            secret: process.env.SESS_SECRET, //create var in .env file
            resave:true,
            saveUninitialized: false,
            cookie: {
                sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
                secure: process.env.NODE_ENV === 'production',
                httpOnly: true,
                maxAge: 60000 //1 min 
            },
            store: MongoStore.create({
                mongoUrl: process.env.MONGO_DB_URI,
                ttl: 60 * 60 * 24, // 1 day
            })
        })
    )
}