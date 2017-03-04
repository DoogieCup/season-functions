'use strict';

(function(){
    var tape = require('tape');

    var Handler = require('../command_handler/handler.js');
    tape('Handler constructs', function(t){
        t.plan(1);

        t.doesNotThrow(() => {
            var handler = new Handler();
        });
    });
})();