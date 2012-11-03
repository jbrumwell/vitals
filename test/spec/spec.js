var health = require('health'),
    pid    = 123,
    meta   = {};

health.add(pid, meta);

health.add([
    {pid: pid, meta: meta}
])

health.remove(pid);

health.remove([pid, pid, pid]);

health.remove(function(proc) {
    return true;
})

health.remove(); //removes all

health.start();

health.stop();

health.get(pid, function(proc) {
    
});

health.get(function(proc) {
    
})

health.length; //number of processes monitoring

health.on('started', function(proc) {
    
});

health.on('added', function(proc) {
    
});

health.on('removed', function(proc) {
    
})

health.on('data', function(proc) {
    //data.meta == meta
});

health.on('stopped', function(proc) {
    
});

