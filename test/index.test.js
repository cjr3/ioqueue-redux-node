'use strict';

const IOQueue = require('../index');
let {createStore} = require('redux');
let path = require('path');

test("First Test", done => {
    const InitState = {
        amount:0
    };
    
    const reducer = function(state, action) {
        if(!state)
            return Object.assign({}, InitState);
        switch(action.type) {
            case 'add' :
                return Object.assign({}, state, {amount:(state.amount + 1)});
            break;
            default : {
    
                return state;
            }
        }
    }
    
    const store = createStore(reducer);
    let IOQ = new IOQueue(store, path.join(__dirname, 'state.json'));
    IOQ.Start().then(() => {
        let timer = setInterval(() => {
            if(store.getState().amount > 3) {
                try {clearInterval(timer);}catch(er){}
                done();
            } else {
                store.dispatch({type:'add'});
            }
        }, 500);
    });
});