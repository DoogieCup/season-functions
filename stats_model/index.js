'use strict';
(function(){
    var Handler = require('./handler.js');
    var azure = require('azure-storage');
    var keyConverter = require('../utils/keyConverter.js');
    var Promise = require('promise');

    module.exports = function(context, event) {

        var eventFetcher = (id, knownVersion, newVersion) => {
            context.log(`Executing event fetcher Id ${id} Known Version ${knownVersion} new version ${newVersion}`);
            let connectionString = process.env.AzureWebJobsDashboard;
            let tableService = azure.createTableService(connectionString);

            var q = `PartitionKey eq '${String(id)}' and RowKey gt '${keyConverter.toVersionKey(knownVersion)}' and RowKey le '${keyConverter.toVersionKey(newVersion)}'`;
            context.log(`Query: ${q}`);
            var query = new azure.TableQuery()
                .where(q);

            var result = new Promise((fulfill, reject) => {
                tableService.queryEntities('SeasonEvents', query, null, function(err, result){
                    if (err){reject(err);}
                    fulfill(result.entries);
                });
            });
            
            return result;
        };

        var writer = (round, playerId, stat) => {
            context.log(`Asked to write ${round} ${playerId} ${JSON.stringify(stat)}`);
        };
        
        var versionWriter = (version) => {};

        var handler = new Handler(context.log,
            eventFetcher,
            writer,
            versionWriter);

        handler.process(0, event);
    }
})();