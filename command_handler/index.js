'use strict';
(function(){
    module.exports = function(context, command) {

        let azure = require('azure-storage');
        var Season = require('./season.js');
        var entGen = azure.TableUtilities.entityGenerator;

        let connectionString = process.env.AzureWebJobsDashboard;
        let tableService = azure.createTableService(connectionString);

        var year = String(command.season);
        var commandName = command.name;

        var query = new azure.TableQuery()
            .where('PartitionKey eq ?', year);

        tableService.queryEntities('SeasonEvents', query, null, function(error, result, response) {
            if (error) {
                throw Error(error);
            }

            var season = new Season(context.log, result.entries);
            season.eventHandler = (event, errorcb) => {
                context.log(`Storing event ${JSON.stringify(event)}`);

                var newEvent = {
                    PartitionKey: entGen.String(String(event.year)),
                    RowKey: entGen.String(String(event.version)),
                    eventType: event.eventType,
                    payload: JSON.stringify(event)
                };

                context.log(`Inserting event:\n${newEvent}`);

                tableService.insertEntity('SeasonEvents',
                    newEvent, function(error, result, response){
                        errorcb(error);
                    });
            };

            switch (commandName){
                case "createSeason":
                    season.create(year);
                break;
            }

            context.done();
        });
    };
})();