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
            e('fixtureAdded', {round:1, homeClubId:'home', awayClubId:'away'})];

        var season = new Season(log, events);

        t.equal(season.rounds[0].fixtures.length, 1);
        t.equal(season.rounds[0].fixtures[0].homeClubId, 'home');
        t.equal(season.rounds[0].fixtures[0].awayClubId, 'away');

        t.end();
    });

    tape('Team submitted', (t) =>{
        var events = [e('seasonCreated', {year:2016}),
            e('roundAdded', {round:1}),
            e('fixtureAdded', {round:1, homeClubId:'home', awayClubId:'away'}),
            e('teamSubmitted', 
                {round:1, 
                    clubId: 'home', 
                    pickedPositions: [{playerId:'1', position:'f'},
                        {playerId:'2', position:'m'}]})];

        var season = new Season(log, events);

        t.equal(season.rounds[0].teams.length, 1);
        t.equal(season.rounds[0].teams[0].clubId, 'home');
        t.equal(season.rounds[0].teams[0].pickedPositions.length, 2);
        t.end();
    });
})();