(function(){
    module.exports = function(context) {

        let azure = require('../azure-storage');

        let connectionString = process.env.AzureWebJobsDashboard;
        let tableService = azure.createTableService(connectionString);

        var query = new azure.TableQuery()
            .top(5)
            .where('PartitionKey eq ?', 2008);

        tableService.queryEntities('SeasonEvents', query, null, function(error, result, response) {
            if (error) {
                throw Error(error);
            }

            context.log('Results: ' + JSON.stringify(result));
        });
    };
})();