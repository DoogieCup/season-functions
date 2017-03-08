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
            var payload = event.payload['_'];
            switch (event.eventType['_']){
                case 'seasonCreated':
                    this.applySeasonCreated(payload);
                break;
                case 'roundAdded':
                    this.applyRoundAdded(payload);
                break;
                case 'fixtureAdded':
                    this.applyFixtureAdded(payload);
                break;
                case 'teamSubmitted':
                    this.applyTeamSubmitted(payload);
                break;
                case 'roundCompleted':
                    this.applyRoundCompleted(payload);
                break;
                case 'roundUncompleted':
                    this.applyRoundUncompleted(payload);
                break;
                case 'statsImported':
                    this.applyStatsImported(payload);
                break;
                default:
                    throw Error(`Didn't recognize event type ${event.eventType}`);
            }
        };

        applySeasonCreated(event){
            this.Id = event.year;
        };

        applyRoundAdded(event){
            this.rounds.push({
                round:event.round,
                normalRound:event.normalRound,
                fixtures:[],
                teams: [],
                stats: []});
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

        applyRoundCompleted(event){
            var round = this.findRound(event.round);
            round.completed = true;
        }

        applyRoundUncompleted(event){
            var round = this.findRound(event.round);
            round.completed = false;
        }

        applyStatsImported(event){
            var round = this.findRound(event.round);

            //event.stats.forEach(function(s){
                var stat = {aflClubId: event.aflClubId, stats: event.stats}
                round.stats.push(stat);
            //}, this);
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