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
                version: this.version + 1
            };

            this.eventHandler(event, (error) => {
                if (error) {
                    this.log(`Failed to raise event ${event}\n${JSON.stringify(error)}`);
                    throw Error(error);
                }
                this.version++;
            });
        };

        addRound(round){
            if (!this.Id){
                throw Error(`Cannot add round to non-existent season`);
            }
            this.log(`Adding round ${round}`);

            var existingRound = this.findRound(round, false);
            if (existingRound){
                throw Error(`Round ${round} already exists in season ${this.Id}`);
            }

            var event = {
                eventType: 'roundAdded',
                year: this.Id,
                payload: {round: round},
                version: this.version + 1
            };

            this.eventHandler(event, (error)=>{
                if (error) {
                    this.log(`Failed to raise event ${event}\n${JSON.stringify(error)}`);
                    throw Error(error);
                }
                this.version++;
            });
        }

        addFixture(round, homeId, awayId){
            /*
            * This should use a state pattern
            * as it's duplicated in multiple command handlers
            */
            this.log(`Adding fixture: ${round} ${homeId} ${awayId}`);
            if (!this.Id){
                throw Error('Cannot add a fixture to a non-existent round');
            }

            var existingFixture = this.findFixture(round, homeId, awayId);
            this.log(`Existing fixture: ${existingFixture}`);
            if (existingFixture){
                throw Error('Found existing fixture!');
            }

            var event = {
                eventType: 'fixtureAdded',
                year: this.Id,
                payload: {
                    round: round,
                    homeClubId: homeId,
                    awayClubId: awayId
                },
                version: this.version + 1
            };

            this.eventHandler(event, (error) => {});
        }

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
            this.log(`Adding fixture ${event.round} ${event.homeClubId} ${event.awayClubId}`);
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

        findRound(round, throwOnNotFound = true){
            if (!round){
                throw Error(`Asked to find a round but no number supplied`);
            }

            var round = this.rounds.find(function (r){
                return r.round === round;
            }, this);

            if (!round && throwOnNotFound){throw Error(`Couldn't find round ${round}`);}

            return round;
        }

        findFixture(round, homeId, awayId){
            this.log(`Finding fixture ${round} ${homeId} ${awayId}`);
            var foundRound = this.findRound(round, false);
            this.log(`Found round ${JSON.stringify(foundRound)}`);
            var fixture = foundRound.fixtures.find(function (f){
                return f.homeClubId === homeId
                    && f.awayClubId === awayId
            });

            return fixture;
        }
    }
})();