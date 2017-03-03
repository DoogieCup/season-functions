'use strict';

(function(){
    module.exports = class{
        constructor(log, events){
            this.log = log;
            this.rounds = [];

            events.forEach(function(event) {
                this.apply(event);
            }, this);
        }

        apply(event) {
            switch (event.eventType){
                case 'seasonCreated':
                    this.applySeasonCreated(event);
                break;
                case 'roundAdded':
                    this.applyRoundCreated(event);
                break;
            }
        };

        applySeasonCreated(event){
            this.Id = event.year;
        };

        applyRoundCreated(event){
            this.rounds.push({round:event.round});
        }
    }
})();