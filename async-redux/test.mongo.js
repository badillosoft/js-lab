const redux = require("./async-redux");
const { MongoClient } = require("mongodb");

function mongo(state, action) {
    if (action.type === "MONGO_CONNECT") {
        return new Promise((resolve, reject) => {
            MongoClient.connect(action.uri, action.options, (err, db) => {
                if(err) {
                    reject(err);
                    return;
                }
                resolve({
                    connected: true,
                    db
                });
            });
        });
    } else if (action.type === "MONGO_GET_USERS") {
        return new Promise((resolve, reject) => {
            const { db } = state;

            db.collection("users").find({}).toArray((err, users) => {
                if(err) {
                    reject(err);
                    return;
                }
                resolve(Object.assign(state, {
                    users
                }));
            });
        });
    }
    return sate || {
        connected: false
    };
}

let $store = null;

redux.createStore({ mongo }).then(store => {
    $store = store;
    console.log(store.getState());
    return redux.dispatch({ type: "MONGO_CONNECT", uri: "mongodb://localhost:27017/test" });
}).then(() => {
    console.log($store.getState());
    return redux.dispatch({ type: "MONGO_GET_USERS" });
}).then(() => {
    console.log($store.getState().mongo.state.users);
});