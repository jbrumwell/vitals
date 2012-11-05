var vitals = require('health'),
    pid    = 123,
    meta   = {};

vitals.add(pid, meta);

vitals.add([
    {pid: pid, meta: meta}
])

vitals.remove(pid);

vitals.remove([pid, pid, pid]);

vitals.remove(function(proc) {
    return true;
})

vitals.remove(); //removes all

vitals.start();

vitals.stop();

vitals.get(pid, function(proc) {
    
});

vitals.get(function(proc) {
    
})

vitals.length; //number of processes monitoring

vitals.on('started', function(proc) {
    
});

vitals.on('added', function(proc) {
    
});

vitals.on('removed', function(proc) {
    
})

vitals.on('data', function(proc) {
    //data.meta == meta
});

vitals.on('stopped', function(proc) {
    
});

