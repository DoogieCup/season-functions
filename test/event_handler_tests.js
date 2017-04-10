'use strict';
(function(){
    var tape = require('tape');
    var sinon = require('sinon');

    var log = (msg) => {console.log(msg);}

    var createEvents = require('./eventBuilder.js')(log);

    var EventHandler = require('../event_handler/handler.js');
    
    tape('Constructor does not throw', (t) => {
        t.doesNotThrow(() => {
            var handler = new EventHandler(log);
        });
        t.end();
    });

    tape('When new event, updates read model', (t) => {
        var events = createEvents([
            {name:'seasonCreated', event:{year:2016}},
            {name:'roundAdded', event:{round:1}}]);

        var fetcher = sinon.stub().returns({
        });

        t.end();
    });
})();