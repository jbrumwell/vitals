var util         = require('util'),
    os           = require('os'),
    Parser       = os.platform().indexOf('win') != -1 ? require('./parsers/win') : require('./parsers/unix'),
    EventEmitter = require('events').EventEmitter;


function Vitals(options) {    
    EventEmitter.call(this);
    
    Parser.call(this);
    
    options.interval = options.interval || 3000;
    
    options.sampleRate = 0.5;
    
    options.maxSamples = options.maxSamples || 100;
        
    this.options = options;
    
    this.length = 0;    
    
    this._running = false;
    
    this._pids = {};  
}

util.inherits(Vitals, EventEmitter);

Vitals.prototype.add = function(pids) {    
    if (! Array.isArray(pids)) {
        pids = typeof pids !== 'object' ? [{pid: pids, meta: arguments[1] || {}}] : [pids];
    }
    
    for (var i = 0; i < pids.length; i++) {
        if (! (typeof pids[i] == 'object')) {
            pids[i] = {pid: pids[i], meta: {}};
        } else {
            pids[i].meta = pids[i].meta || {};
        }
                
        if (! this._pids[ pids[i].pid ]) {
            pids[i].meta._started = new Date().getTime();
            
            this._pids[ pids[i].pid ] = pids[i];
            this.emit('added', pids[i]);
        }
    }
    
    this.length = Object.keys(this._pids).length;
    
    return this;
}

Vitals.prototype.remove = function(pids) {       
    if (typeof pids == 'undefined') {
        this._pids = {};
    } else if (typeof pids == 'function') {
        this._filter(pids);
    } else {
        if (! Array.isArray(pids)) {
            pids = [pids];
        }   
        
        this._filter(function(proc) {
            return pids.indexOf(proc.pid) === -1;    
        })
    }                        
    
    this.length = Object.keys(this._pids).length;
    
    return this;
}

Vitals.prototype._filter = function(fn) {
    var out = [],
        _this = this,         
        keys = Object.keys(_this._pids),
        callback;
    
    keys.forEach(function(k) {
        out.push(_this._pids[ k ]);
    })
    
    callback = function(proc) {
        var result = fn.call(null, proc);
        
        if (! result) {           
           _this.emit('removed', proc); 
           delete _this._pids[proc.pid];
        }
        
        return result;
    }
    
    out = out.filter(callback);    
        
    return out;
}

Vitals.prototype.get = function(pids, one, cb) {
    var ret = [];
    
    cb = typeof one == 'function' ? one : cb;
            
    if (typeof pids == 'undefined') {
        this._pids.forEach(function(proc) {
            ret.push(proc);
        });
    } else if (typeof pids == 'function') {
        ret = this._filter(pids);
    } else {
        if (! Array.isArray(pids)) {
            pids = [pids];
            one  = true;
        }   
        
        ret = this._filter(function(proc) {
            return pids.indexOf(proc.pid) !== -1;    
        })
    }  
    
    ret = one === true ? ret[0] : ret;
    
    if (cb && typeof cb == 'function') {
        cb(ret);
    }
    
    return ret;
}

Vitals.prototype.start = function() {        
    if (! this.intervalId) {
        this._run();
        
        this.intervalId = setInterval(this._run.bind(this), this.options.interval);
    }
            
    this.emit('started');
}

Vitals.prototype.stop = function() {    
    clearInterval(this.intervalId);
    
    this.intervalId = null;
    
    this.emit('stopped');        
}

Vitals.prototype._run = function() {
    var _this = this,
        exec  = require('child_process').exec;
    
    if (this._running || ! Object.keys(this._pids).length) {
        return;        
    }
    
    this._running = true;
        
    exec(this._command, function() {
        var died = _this._parse.apply(_this, arguments);
                
        if (died.length) {
            died.forEach(function(pid) {                                
                var _pid = _this._pids[pid];
                
                if (_pid) {                   
                    _pid.meta.died = true;
                    
                    _this.emit('removed', _pid);
                    
                    delete _this._pids[ pid ];
                }
            })
        }                
        
        _this._running = false;
    });
}

Vitals.prototype._collect = function(proc, data) {
    if (! Array.isArray(proc.meta._samples)) {
        proc.meta._samples = [];
    }
        
    if (Math.random() <= this.options.sampleRate) {
        data.collected = new Date().getTime();                            
                    
        proc.meta._samples.push(data);
                    
        if (proc.meta._samples.length > this.options.maxSamples) {                        
            proc.meta._samples = proc.meta._samples.splice(this.options.maxSamples * -1);
        }
    }
}

Vitals.prototype.emit = function() {
    var _this = this,
        args  = arguments;
    
    process.nextTick(function() {
        EventEmitter.prototype.emit.apply(_this, args);
    })
}

module.exports = function(options) {
    return new Vitals(options || {});
}
