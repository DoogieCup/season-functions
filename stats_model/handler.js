'use strict';

(function(){
    var keyConverter = require('../utils/keyConverter.js');
    var Promise = require('promise');

    module.exports = class{
        constructor(log, eventFetcher, writer, versionWriter){
            this.log = log;
            this.writer = writer;
            this.eventFetcher = eventFetcher;
            this.versionWriter = versionWriter;
        };

        process(currentVersion, newEvent){
            return new Promise((accept, reject) => {
                try{
                    if (!newEvent){
                        throw Error("Couldn't process message as the event was empty!");
                    }
                    
                    var year = newEvent.PartitionKey['_'];
                    var version = keyConverter.parseVersion(newEvent.RowKey['_']);
                    
                    var eventsToProcess = this.eventFetcher(year, currentVersion, version);
                    this.log(`Types: ${typeof(year)}, ${typeof(currentVersion)}, ${typeof(version)}`);
                    this.log(`Values: ${year}, ${currentVersion}, ${version}`);

                    var finalVersion = currentVersion;

                    eventsToProcess.then((events => {
                        if (!events) {
                            throw Error("Couldn't find any events to process");
                        }
                        this.log(`Found events ${JSON.stringify(events)}`);
                        events.forEach(function(element) {
                        if (element.eventType['_'] !== 'statsImported'){
                            finalVersion++;
                            return;
                        }

                        var payload = JSON.parse(element.payload['_']);
                        
                        var round = payload.round;
                        finalVersion++;
                        this.log(`About to process ${payload.stats.length} stats`);

                        var promise = new Promise((accept, reject) => {
                            accept();
                        });

                        payload.stats.forEach(function(stat){
                            this.log(`Processing ${keyConverter.toRoundKey(year, round)}, ${stat.playerId}`)
                            promise.then(() => {
                                this.writer(keyConverter.toRoundKey(year, round), stat.playerId, stat)
                                .catch((err)=>{
                                    this.log(`Failed to write the read model: ${err}`);
                                });
                            }).catch((err)=>{
                                    this.log(`Read model chain failed: ${err}`);
                                });;
                        }, this);
                    }, this);
                    this.log(`VersionWriter ${year} ${finalVersion}`);
                    this.versionWriter(year, finalVersion).catch((err) => {
                        this.log(`Failed to write the version: ${err}`);
                    });
                    accept();
                    })).catch((err) => {
                        this.log(`Failed to fetch events ${err}`);
                        throw Error(err);
                    });
                }
                catch(err){
                    reject(err);
                }
            });            
        };
    }
})();