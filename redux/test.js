/**
 * Alan Badillo Salas (badillo.soft@hotmail.com)
 * github: badillosoft
 * 
 * test.js
 * 
 * Test Redux.
 */

function hello(state, action) {
    if (action.type === "HELLO") {
        return `Hello :D, ${action.message}`;
    } else if (!state) {
        return "Hello :/ (state is not defined)"
    }
    return state;
}

const { combineReducers, createStore } = require("redux");

const reducers = combineReducers({ hello });

const store = createStore(reducers);

console.log(store.getState());

store.dispatch({ type: "HELLO", message: "My name is Null" });

console.log(store.getState());