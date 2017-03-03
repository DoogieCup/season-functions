'use strict';

(function(){
    var tape = require('tape');
    
    var Season = require('../command_handler/season.js');

    tape('Constructor does now throw', (t) => {
        t.plan(1);
        t.doesNotThrow(() => {var season = new Season();});
    });

    tape('Season created', (t) => {
        var season = new Season();
        var event = {eventType: 'seasonCreated', year:2016}

        season.apply(event);

        t.equal(season.Id, 2016);

        t.end();
    });
})();