const reducers = {};
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

function combineReducers(_reducers) {
    Object.keys(_reducers).map(name => {
        reducers[name] = _reducers[name];
    });

    return reducers;
}

function createStore(_reducers) {
    combineReducers(_reducers);

    return dispatch("$APP_START").then(() => {
        console.log("Async-Redux started");
    }, err => {
        console.error("Async-Redux error", err);
    }).then(() => {
        return {
            getState: () => {
                return stores;
            }
        };
    });
}

module.exports = {
    dispatch,
    combineReducers,
    createStore,
};