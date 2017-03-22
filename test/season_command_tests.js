'use strict';
(function(){
    var tape = require('tape');
    var sinon = require('sinon');
    
    var Season = require('../command_handler/season.js');

    var log = (msg) => {console.log(msg);}

    function createEvent(name, event, version){
        log(`Creating event: ${name} ${JSON.stringify(event)} Version ${version}`);
        var newEvent = {};

        newEvent.payload = {_: JSON.stringify(event)};
        newEvent.eventType = {_: name};
        newEvent.version = {_: version};

        return newEvent;
    }

    function e(events)
    {
        var version = 1;
        var returns = [];
        log(`Events ${JSON.stringify(events)}`);
        events.forEach(function(event) {
             returns.push(createEvent(event.name, event.event, version++));
        }, this);

        return returns;
    }

    tape('No events has empty season', (t) => {
        var season;
        t.doesNotThrow(() => {season = new Season(log);});
        t.false(season.Id);
        t.end();
    });

    tape('Season create command sets Id and raises event', (t) => {
        var season = new Season(log);
        var raisedEvents = [];
        season.eventHandler = (event) => {raisedEvents.push(event)};
        t.doesNotThrow(() => {season.create(2015);});
        t.equal(season.Id, 2015);
        t.equal(raisedEvents.length, 1);
        var event = raisedEvents[0];
        t.equal(event.eventType, 'seasonCreated');
        t.equal(event.year, 2015);
        t.end();
    });

    tape('Creating a season that already exists throws', (t) => {
        var events = e([
            {name:'seasonCreated', event:{year:2016}}]);
        var season = new Season(log, events);
        t.throws(() => {season.create(2016);});
        t.end();
    });

    tape('Creating a season which conflicts on write throws', (t) => {
        var season = new Season(log);
        season.eventHandler = (event, callback) => {
            callback({
                error: "DuplicateEntity"
            });
        };

        t.throws(() => {season.create(2016);});

        t.end();
    });
})();