'use strict';

(function(){
    module.exports = class{
        constructor(log, events){
            this.log = log;
            this.rounds = [];

            events.forEach(function(event) {
                this.apply(event);
            }, this);
        }

        apply(event) {
            switch (event.eventType){
                case 'seasonCreated':
                    this.applySeasonCreated(event);
                break;
                case 'roundAdded':
                    this.applyRoundAdded(event);
                break;
                case 'fixtureAdded':
                    this.applyFixtureAdded(event);
                break;
            }
        };

        applySeasonCreated(event){
            this.Id = event.year;
        };

        applyRoundAdded(event){
            this.rounds.push({round:event.round,fixtures:[]});
        }

        applyFixtureAdded(event){
            var round = this.rounds.find(function(e) {
                return e.round === event.round
            }, this);

            round.fixtures.push({home:event.home, away:event.away});
        }
    }
})();