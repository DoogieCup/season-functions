'use strict';
(function(){
    var tape = require('tape');
    
    var Season = require('../command_handler/season.js');

    var log = (msg) => {console.log(msg);}

    function e(name, event){

        var newEvent = {};

        newEvent.payload = {_: JSON.stringify(event)};
        newEvent.eventType = {_: name};

        return newEvent;
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
        var events = [
            e('seasonCreated', {year:2016})];
        var season = new Season(log, events);
        t.throws(() => {season.create(2016);});
        t.end();
    });
})();