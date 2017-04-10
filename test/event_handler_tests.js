'use strict';
(function(){
    var tape = require('tape');
    var sinon = require('sinon');

    var log = (msg) => {console.log(msg);}

    var createEvents = require('./eventBuilder.js')(log);

    var EventHandler = require('../stats_model/handler.js');
    
    tape('Constructor does not throw', (t) => {
        t.doesNotThrow(() => {
            var handler = new EventHandler(log);
        });
        t.end();
    });

    tape('When new event, updates stats read model', (t) => {
        var firstStat = {
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
                    };
        var secondStat = {
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
                    };

        var events = createEvents(2016, [
            {name:'seasonCreated', event:{year:2016}},
            {name:'roundAdded', event:{round:1}},
            {name:'statsImported', event:{
                round:1, aflClubId:'cats',
                stats:[
                    firstStat,
                    secondStat
                ]}},
                {name:'roundAdded', event:{round:2}}]);

        var fetcher = sinon.stub().returns(events);

        var versionWriter = sinon.spy();

        var writer = sinon.spy();
        writer.withArgs(201601, 'first', firstStat);
        writer.withArgs(201601, 'first', secondStat);

        var newEvent = events[events.length-1];

        var handler = new EventHandler(log, fetcher, writer, versionWriter);

        handler.process(0, newEvent);

        t.assert(fetcher.calledWith('2016', 0, 4));
        t.assert(versionWriter.calledWith('2016', 4));
        t.assert(writer.withArgs('201601', 'first', firstStat).calledOnce);
        t.assert(writer.withArgs('201601', 'second', secondStat).calledOnce);

        t.end();
    });
})();