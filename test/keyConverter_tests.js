(function(){
    var tape = require('tape');

    var keyConverter = require('../utils/keyConverter.js');

    tape('Version int to string', (t) =>{
        t.equal(keyConverter.toVersionKey(1), '0000000001');
        t.end();
    });

    tape('Version string to int', (t) => {
        t.equal(keyConverter.parseVersion('0000000001'), 1);
        t.end();
    });

    tape('Round ints to string', (t) => {
        t.equal(keyConverter.toRoundKey(2016, 1), '201601');
        t.end();
    });

    tape('Round string to ints', (t) => {
        var round = keyConverter.parseRound('201601');
        t.equal(round.round, 1);
        t.equal(round.year, 2016);
        t.end();
    });
})();