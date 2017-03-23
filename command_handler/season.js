'use strict';

(function(){
    module.exports = class{
        constructor(log, events){
            this.log = log;
            this.rounds = [];
            this.eventHandler = (event) => {};
            this.version = 0;

            if (events)  {
                events.forEach(function(event) {
                    this.log(`Received event ${JSON.stringify(event)}`);
                    this.apply(event);
                    this.version = event.RowKey['_'];
                }, this);
            }
        };

        create(season){
            this.log(`Processing season ${season}`);
            if (this.Id)
            {
                throw Error(`Season already exists. ${JSON.stringify(this)}`);
            }

            this.Id = season;
            var event = {
                eventType: 'seasonCreated',
                year: season,
                payload: {year: season},
                version: this.version++
            };

            this.eventHandler(event, (error) => {
                if (error) {
                    this.log(`Failed to raise event ${event}\n${JSON.stringify(error)}`);
                    throw Error(error);
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