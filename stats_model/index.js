'use strict';
(function(){
    var Handler = require('./handler.js');
    var azure = require('azure-storage');
    var keyConverter = require('../utils/keyConverter.js');
    var Promise = require('promise');
    let connectionString = process.env.AzureWebJobsDashboard;
    let entGen = azure.TableUtilities.entityGenerator;
    var readTableCreated = false;

    module.exports = function(context, event) {
        var eventFetcher = (id, knownVersion, newVersion) => {
            let tableService = azure.createTableService(connectionString);
            context.log(`Executing event fetcher Id ${id} Known Version ${knownVersion} new version ${newVersion}`);
            
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
            var tableService = azure.createTableService(connectionString);
            context.log(`Asked to write ${round} ${playerId} ${JSON.stringify(stat)}`);
            var result = (new Promise((fulfill, reject)=>{
                if (readTableCreated){
                    fulfill();
                    return;
                }

                tableService.createTableIfNotExists('StatsReadModels', function(error, result, response) {
                    if (error) {reject(error);}
                    context.log(`Ensured StatsReadModels table, result ${JSON.stringify(result)}`);
                    readTableCreated = true;
                    fulfill();
                });
            })).then(() => {return new Promise((fulfill, reject) => {
                var entity = {
                    PartitionKey: entGen.String(String(playerId)),
                    RowKey: entGen.String(String(round)),
                    Stat: JSON.stringify(stat)
                };

                tableService.insertEntity('StatsReadModels', entity, function(error, result, response) {
                    if (error) {
                        reject(error);
                    }
                    context.log(`New stat written ${playerId} ${round} ${stat}`);
                    fulfill();
                });
            })});

            return result;
        };
        
        var versionWriter = (year, version) => {
            let tableService = azure.createTableService(connectionString);
            var result = (new Promise((fulfill, reject)=>{
                tableService.createTableIfNotExists('StatsReadVersion', function(error, result, response) {
                    if (error) {reject(error);}
                    context.log(`Ensured StatsReadVersion table, result ${JSON.stringify(result)}`);
                    fulfill();
                });
            })).then(() => {return new Promise((fulfill, reject) => {
                var versionRow = {
                    PartitionKey: entGen.String(String(year)),
                    RowKey: entGen.String(String(version))
                };

                tableService.insertEntity('StatsReadVersion', versionRow, function(error, result, response) {
                    if (error) {
                        reject(error);
                    }
                    context.log(`New version written ${year} ${version}`);
                    fulfill();
                });
            })});

            return result;
        };

        var handler = new Handler(context.log,
            eventFetcher,
            writer,
            versionWriter);

        handler.process(0, event);
    }
})();