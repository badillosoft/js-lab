/**
 * Alan Badillo Salas (badillo.soft@hotmail.com)
 * github: badillosoft
 * 
 * test.js
 * 
 * Comprueba los conceptos descritos en el README.md
 */

function getUsers() {
    const fakeUsers = [{
        name: "batman",
        email: "batman@justice.com"
    }, {
        name: "superman",
        email: "superman@justice.com"
    }];
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve(fakeUsers);
        }, 5000);
    });
}

function users(state, action) {
    if (action.type === "UPDATE_USERS") {
        return getUsers();
    }

    return state || [];
}

const reducers = {
    users1: users,
    users2: users
};
const stores = {};

function dispatch(action) {
    action = action || { type: "" };
    return Promise.all(Object.keys(reducers).map(name => {
        const reducer = reducers[name];
        stores[name] = stores[name] || {};
        stores[name].lock = true;
        const state = stores[name].state;
        return Promise.resolve().then(() => {
            return reducer(state, action);
        }).then(newState => {
            return { 
                actionType: action.type || "",  
                reductorName: name,
                newState,
                oldState: state || null,
            };
        }, err => {
            return { 
                actionType: action.type || "",
                reductorName: name, 
                trace: err,
            };
        });
    })).then(states => {
        return states.map(state => {
            const { reductorName, newState } = state;
            stores[reductorName].lock = false;
            stores[reductorName].state = newState;
            return state;
        });
    });
}

console.log(stores);

dispatch({ type: "APP_START" }).then(states => {
    console.log("-- APP_START STATES --", new Date());
    console.log(JSON.stringify(states, null, 2));
    console.log("-- APP_START STORES --");
    console.log(JSON.stringify(stores, null, 2));
    dispatch({ type: "UPDATE_USERS" }).then(states => {
        console.log("-- UPDATE_USERS STATES --", new Date());
        console.log(JSON.stringify(states, null, 2));
        console.log("-- UPDATE_USERS STORES --");
        console.log(JSON.stringify(stores, null, 2));
    });
});

setTimeout(() => {
    console.log("-- STORES --", new Date());
    console.log(JSON.stringify(stores, null, 2));
}, 2000);