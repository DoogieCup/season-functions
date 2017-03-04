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
        var events = [
            e('seasonCreated', {year:2016}),
            e('roundAdded', {round:1})];
        var season = new Season(log, events);

        t.equal(season.rounds.length, 1);
        t.equal(season.rounds[0].round, 1);
        t.end(); 
    });

    tape('Fixutre added', (t) => {
        var events = [
            e('seasonCreated', {year:2016}),
            e('roundAdded', {round:1}),
            e('fixtureAdded', {
                round:1, 
                homeClubId:'home', 
                awayClubId:'away'})];

        var season = new Season(log, events);

        t.equal(season.rounds[0].fixtures.length, 1);
        t.equal(season.rounds[0].fixtures[0].homeClubId, 'home');
        t.equal(season.rounds[0].fixtures[0].awayClubId, 'away');

        t.end();
    });

    tape('Team submitted', (t) =>{
        var events = [
            e('seasonCreated', {year:2016}),
            e('roundAdded', {round:1}),
            e('fixtureAdded', {round:1, homeClubId:'home', awayClubId:'away'}),
            e('teamSubmitted', 
                {
                    round:1, 
                    clubId: 'home', 
                    pickedPositions: [{playerId:'1', position:'f'},
                        {playerId:'2', position:'m'}]})];

        var season = new Season(log, events);

        t.equal(season.rounds[0].teams.length, 1);
        t.equal(season.rounds[0].teams[0].clubId, 'home');
        t.equal(season.rounds[0].teams[0].pickedPositions.length, 2);
        t.end();
    });

    tape('Round completed', (t) => {
        var events = [
            e('seasonCreated', {year:2016}),
            e('roundAdded', {round:1}),
            e('roundCompleted', {round:1})];

        var season = new Season(log, events);
        t.equal(season.rounds[0].completed, true);
        t.end();
    });

    tape('Round uncompleted', (t) => {
        var events = [
            e('seasonCreated', {year:2016}),
            e('roundAdded', {round:1}),
            e('roundCompleted', {round:1}),
            e('roundUncompleted', {round:1})];

        var season = new Season(log, events);
        t.equal(season.rounds[0].completed, false);
        t.end();
    });

    tape('Stats imported', (t) =>{
        var events = [
            e('seasonCreated', {year:2016}),
            e('roundAdded', {round:1}),
            e('statsImported', {
                round:1, aflClubId:'cats',
                stats:[
                    {
                        playerId:'first',
                        goals: 1,
                        behinds: 2,
                        disposals: 3,
                        marks: 4,
                        hitouts: 5,
                        tackles: 6,
                        handballs: 7,
                        goalAssists: 8,
                        inside50s: 9,
                        freesFor: 10,
                        freesAgainst: 11
                    },
                    {
                        playerId:'second',
                        goals: 11,
                        behinds: 12,
                        disposals: 13,
                        marks: 14,
                        hitouts: 15,
                        tackles: 16,
                        handballs: 17,
                        goalAssists: 18,
                        inside50s: 19,
                        freesFor: 20,
                        freesAgainst: 21
                    }
                ]})];
        var season = new Season(log, events);

        var stats = season.rounds[0].stats;
        t.equal(season.rounds[0].stats.length, 2);
        t.equal(stats[0].aflClubId, 'cats');
        t.equal(stats[1].aflClubId, 'cats');

        t.equal(stats[0].playerId, 'first');
        t.equal(stats[1].playerId, 'second');

        t.equal(stats[0].goals, 1);
        t.equal(stats[1].goals, 11);
        t.end();
    });
})();