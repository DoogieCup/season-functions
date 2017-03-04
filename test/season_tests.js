'use strict';

(function(){
    var tape = require('tape');
    
    var Season = require('../command_handler/season.js');

    var log = (msg) => {console.log(msg);}

    function e(name, event){
        event.eventType = name;
        return event;
    }

    tape('Constructor does now throw', (t) => {
        t.plan(1);
        t.doesNotThrow(() => {var season = new Season(log, []);});
    });

    tape('Season created', (t) => {
        var event = e('seasonCreated', {year:2016});
        var season = new Season(log, [event]);

        t.equal(season.Id, 2016);

        t.end();
    });

    tape('Round added', (t) => {
        var events = [e('seasonCreated', {year:2016}),
            e('roundAdded', {round:1})];
        var season = new Season(log, events);

        t.equal(season.rounds.length, 1);
        t.equal(season.rounds[0].round, 1);
        t.end(); 
    });

    tape('Fixutre added', (t) => {
        var events = [e('seasonCreated', {year:2016}),
            e('roundAdded', {round:1}),
            e('fixtureAdded', {round:1, home:'home', away:'away'})];

        var season = new Season(log, events);

        t.equal(season.rounds[0].fixtures.length, 1);

        t.end();
    });
})();