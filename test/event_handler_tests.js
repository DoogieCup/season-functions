'use strict';
(function(){
    var tape = require('tape');
    var sinon = require('sinon');

    var log = (msg) => {console.log(msg);}

    var EventHandler = require('../event_handler/handler.js');
    
    tape('Constructor does not throw', (t) => {
        t.doesNotThrow(() => {
            var handler = new EventHandler(log);
        });
        t.end();
    });

    tape('When new event, updates read model', (t) => {
        var fetcher = sinon.stub().returns({
        });
        
        t.end();
    });
})();