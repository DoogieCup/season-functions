'use strict';
(function(){
    var tape = require('tape');
    var sinon = require('sinon');
    
    var Season = require('../command_handler/season.js');

    var log = (msg) => {console.log(msg);}

    var createEvents = require('./eventBuilder.js')(log);

    tape('No events has empty season', (t) => {
        var season;
        t.doesNotThrow(() => {season = new Season(log);});
        t.false(season.Id);
        t.end();
    });

    tape('Season create command sets Id and raises event', (t) => {
        var season = new Season(log);
        var raisedEvents = [];
        season.eventHandler = (event, errorcb) => {raisedEvents.push(event); errorcb(null);};
        t.doesNotThrow(() => {season.create(2015);});
        t.equal(season.Id, 2015);
        t.equal(raisedEvents.length, 1);
        var event = raisedEvents[0];
        t.equal(event.eventType, 'seasonCreated');
        t.equal(event.year, 2015);
        t.equal(season.version, 1);
        t.end();
    });

    tape('Creating a season that already exists throws', (t) => {
        var events = createEvents([
            {name:'seasonCreated', event:{year:2016}}]);
        var season = new Season(log, events);
        t.throws(() => {season.create(2016);});
        t.equal(season.version, 1);
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
        t.equal(season.version, 0);
        t.end();
    });

    tape('Adding a round to non-existent season throws', (t) => {
        var season = new Season(log);
        t.throws(() => {season.addRound(1)});
        t.end();
    });

    tape('Adding a round raises event', (t) => {
        var events = createEvents([{name: 'seasonCreated', event:{year:2016}}]);
        var season = new Season(log, events);
        season.eventHandler = (event, callback) => {
            t.equal(event.eventType, 'roundAdded');
            t.equal(event.year, 2016);
            t.equal(event.version, 2);
            t.equal(event.payload.round, 1);
            callback();
        };
        season.addRound(1);
        t.end();
    });

    tape('Adding a duplicate round throws', (t) => {
        var events = createEvents([
            {name: 'seasonCreated', event:{year:2016}},
            {name: 'roundAdded', event:{round:1}}]);
        var season = new Season(log, events);
        season.eventHandler = (event, callback) => {
            t.equal(event.eventType, 'roundAdded');
            t.equal(event.year, 2016);
            t.equal(event.version, 2);
            t.equal(event.payload.round, 1);
            callback();
        };
        t.throws(() => {season.addRound(1)});
        t.end();
    });

    tape('Adding a fixture to a non-exitent season throws', (t) => {
        var season = new Season(log);
        t.throws(() => {season.addFixture(1, 'home', 'away')});
        t.end();
    });

    tape('Adding a fixture raises an event', (t) => {
        var events = createEvents([
            {name: 'seasonCreated', event:{year:2016}},
            {name: 'roundAdded', event:{round:1}}]);
        var season = new Season(log, events);
        season.eventHandler = (event, callback) => {
            t.equal(event.eventType, 'fixtureAdded');
            t.equal(event.year, 2016);
            t.equal(event.version, 3);
            t.equal(event.payload.round, 1);
            t.equal(event.payload.homeClubId, 'home');
            t.equal(event.payload.awayClubId, 'away');
            callback();
        };
        season.addFixture(1, 'home', 'away');
        t.end();
    });

    tape('Adding a duplicate fixture raises an error', (t) => {
        var events = createEvents([
            {name: 'seasonCreated', event:{year:2016}},
            {name: 'roundAdded', event:{round:1}},
            {name:'fixtureAdded', event:{
                round:1,
                homeClubId: 'home',
                awayClubId: 'away'}
            }]);
        var season = new Season(log, events);
        season.eventHandler = (event, callback) => {
            t.equal(event.eventType, 'fixtureAdded');
            t.equal(event.year, 2016);
            t.equal(event.version, 4);
            t.equal(event.payload.round, 1);
            t.equal(event.payload.homeClubId, 'home');
            t.equal(event.payload.awayClubId, 'away');
            callback();
        };
        t.throws(() => {season.addFixture(1, 'home', 'away')});
        t.end();
    });
})();