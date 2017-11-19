/**
 * Alan Badillo Salas (badillo.soft@hotmail.com)
 * github: badillosoft
 * 
 * test.mongo.js
 * 
 * This experiment connects MongoDB in Redux.
 */

const { MongoClient } = require("mongodb");

// Create some actions to mongo
function mongo(state, action) {

    if (action.type === "MONGO_CONNECTED") {
        return {
            connected: true,
            db: action.db
        };
    }

    return {
        connected: false
    };
}