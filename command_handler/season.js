'use strict';

(function(){
    module.exports = class{
        constructor(log, events){
            this.log = log;
            this.rounds = [];
            this.eventHandler = (event) => {};

            if (events)  {
                events.forEach(function(event) {
                    this.apply(event);
                }, this);
            }
        };

        create(year){
            if (this.Id)
            {
                throw Err('Season already exists.');
            }

            this.Id = year;
            var event = {
                eventType: 'seasonCreated',
                year: year
            };

            this.eventHandler(event, (error) => {
                if (error) {
                    this.log(`Failed to raise event ${JSON.stringify(event)}\n${JSON.stringify(error)}`);
                    throw error;
                }
            });
        };

        apply(event) {
            var payload = JSON.parse(event.payload['_']);
            switch (event.eventType['_']){
                case 'seasonCreated':
                    this.log(`Applying season created ${JSON.stringify(payload)}`);
                    this.applySeasonCreated(payload);
                break;
                case 'roundAdded':
                    this.log(`Applying round added ${JSON.stringify(payload)}`);
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

            var stat = {aflClubId: event.aflClubId, stats: event.stats}
            round.stats.push(stat);
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