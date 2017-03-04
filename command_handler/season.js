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
                default:
                    throw Error(`Didn't recognize event type ${event.eventType}`);
            }
        };

        applySeasonCreated(event){
            this.Id = event.year;
        };

        applyRoundAdded(event){
            this.rounds.push({round:event.Round,fixtures:[]});
        }

        applyFixtureAdded(event){
            var round = this.rounds.find(function(e) {
                return e.round === event.RoundNumber
            }, this);

            if (!round){throw Error(`Couldn't find round ${event.RoundNumber}`);}

            round.fixtures.push({homeClub:event.HomeClub, awayClub:event.AwayClub});
        }
    }
})();