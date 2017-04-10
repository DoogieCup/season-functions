'use strict';

(function(){
    var keyConverter = require('../utils/keyConverter.js');

    module.exports = class{
        constructor(log, eventFetcher, writer, versionWriter){
            this.log = log;
            this.writer = writer;
            this.eventFetcher = eventFetcher;
            this.versionWriter = versionWriter;
        };

        process(currentVersion, newEvent){
            if (!newEvent){
                throw Error("Couldn't process message as the event was empty!");
            }
            
            var year = newEvent.PartitionKey['_'];
            var version = keyConverter.parseVersion(newEvent.RowKey['_']);
            
            var eventsToProcess = this.eventFetcher(year, currentVersion, version);
            this.log(`Types: ${typeof(year)}, ${typeof(currentVersion)}, ${typeof(version)}`);
            this.log(`Values: ${year}, ${currentVersion}, ${version}`);

            var finalVersion = currentVersion;

            eventsToProcess.forEach(function(element) {
                if (element.eventType['_'] !== 'statsImported'){
                    finalVersion++;
                    return;
                }

                var payload = JSON.parse(element.payload['_']);
                
                var round = payload.round;
                finalVersion++;
                
                payload.stats.forEach(function(stat){
                    this.writer(keyConverter.toRoundKey(year, round), stat.playerId, stat);
                }, this);
            }, this);
            this.log(`VersionWriter ${year} ${finalVersion}`);
            this.versionWriter(year, finalVersion);
        };
    }
})();