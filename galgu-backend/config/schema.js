/**
 * Config Schema spec for galguapp
 *
 */

module.exports = {
    env: {
        doc: "The applicaton environment.",
        format: ["production", "development"],
        default: "development",
        env: "NODE_ENV"
    },
    dburi: {
        doc: "The MongoDB uri to bind",
        format: "String",
        default: "mongodb://test:galgugoforever@ds011790.mlab.com:11790/heroku_w2c75cq4",
        env: "MONGOLAB_URI",    // heroky exposes it to env vars, here
        arg: "mongodb-uri"
    }
};