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
                case 'teamSubmitted':
                    this.applyTeamSubmitted(event);
                break;
                default:
                    throw Error(`Didn't recognize event type ${event.eventType}`);
            }
        };

        applySeasonCreated(event){
            this.Id = event.year;
        };

        applyRoundAdded(event){
            this.rounds.push({round:event.round,
                fixtures:[],
                teams: []});
        }

        applyFixtureAdded(event){
            var round = this.findRound(event.round);
            round.fixtures.push({homeClubId:event.homeClubId, 
                awayClubId:event.awayClubId});
        }

        applyTeamSubmitted(event){
            var round = this.findRound(event.round);
            round.teams.push({clubId: event.clubId,
                                pickedPositions: event.pickedPositions});
        }

        findRound(round){
            if (!round){
                throw Error(`Asked to find a round but no number supplied`);
            }

            var round = this.rounds.find(function (r){
                return r.round === round;
            }, this);

            if (!round){throw Error(`Couldn't find round ${round}`);}

            return round;
        }
    }
})();