'use strict';

(function(){
    var tape = require('tape');

    var Handler = require('../command_handler/handler.js');
    
    console.log('here');
    tape('First test', function(t){
        t.plan(1);

        t.equal(1, 1);
    });
})();