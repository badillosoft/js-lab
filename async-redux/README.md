# Async Redux

by badillosoft

## Motivación

Utilizando *Redux*, intento crear procesos asíncronos como parte del flujo, por ejemplo, una llamada a la base de datos, una petición web, etc. ¿Existe un flujo que sea asíncrono y pueda seguir después de realizar la tarea?

Vamos a intentarlo. Supongamos que queremos definir un almacén que al solicitarle los usuarios este tenga que demorar algunos segundos antes de entregarlos, sería un almacén asíncrono:

~~~js
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
~~~

Arriba hemos definido una función asíncrona que nos devuelve una lista falsa de usuarios a los 5 segundos, simulando una consulta a la base de datos o a un api.

Imaginemos ahora que nuestro almacén recibe la acción `UPDATE_USERS` la cual debe traer los datos obtenidos por la función `getUsers(...)`.

~~~js
function users(state, action) {
    if (action === "UPDATE_USERS") {
        return getUsers();
    }

    return state || [];
}
~~~

El reductor puede devolver una promesa o no, en tal caso de recibir una promesa, deberíamos esperarla al momento de solicitar el estado.

~~~js
const reducers = {
    users1: users,
    users2: users
};
const stores = {};

function dispatch(action) {
    return Promise.all(Object.keys(reducers).map(name => {
        const reducer = reducers[name];
        stores[name] = stores[name] || {};
        const state = stores[name].state;
        return Promise.resolve().then(() => {
            return reducer(state, action);
        }).then(newState => {
            return { name, oldState: state || null, newState };
        });
    })).then(states => {
        return states.map(state => {
            const { name, newState } = state;
            stores[name].state = newState;
            return state;
        });
    });
}
~~~

En el ejemplo anterior se definen dos reductores que hacen lo mismo (`users1`, `users2`), ambos demoran 5 segundos en actualizar su almacén. Observa que el almacén se llena automáticamente cuando se despachan las acciones. El despachador ahora, mediante promesas, evalua cada una de las promesas y si es necesario, espera a que termine en paralelo. Así cada reductor podrá tardar un tiempo indeterminado en cumplir su trabaj de almacenamiento y una vez que este listo actualizará su almacenamiento. Aquí el ejemplo:

~~~js
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
~~~

Observa que primero se despacha la acción `APP_START` la cual no tiene ningún significado especial, posteriormente, cuando el despachador termina, devuelve un arreglo con cada uno de los reductores aplicando la acción y devolviendo su cambio de estado. Finalmente