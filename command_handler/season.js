'use strict';

(function(){
    module.exports = class{
        constructor(log){
            this.log = log;
        }

        apply(event) {
            this.Id = event.year;
        };
    }
})();