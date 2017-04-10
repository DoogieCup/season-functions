(function(){

    module.exports = function(log){
        this.log = log;

        return createEvents;
    }

    function createEvent(name, event, version){
        this.log(`Creating event: ${name} ${JSON.stringify(event)} Version ${version}`);
        var newEvent = {};

        newEvent.payload = {_: JSON.stringify(event)};
        newEvent.eventType = {_: name};
        newEvent.RowKey = {_: version};

        return newEvent;
    }

    function createEvents(events)
    {
        var version = 1;
        var returns = [];
        this.log(`Events ${JSON.stringify(events)}`);
        events.forEach(function(event) {
             returns.push(createEvent(event.name, event.event, version++));
        }, this);

        return returns;
    }
})();