module.exports = function() {
    this._command = 'tasklist /NH /V /FO CSV';
    
    this._parse = function(error, stdout, stderr) {
        var lines = stdout.split('\n'),
            _this = this,            
            pids  = Object.keys(this._pids);
    
        lines.forEach(function(line) {
            var data   = line.trim().split('","'),
                pid    = data[1],
                pi     = pids.indexOf(pid);
            
            
            if (pid && pi !== -1) {                  
                data = {
                    cputime: data[ data.length - 2 ].replace(':', '').replace(':', '.'),
                    memoryUsage: data[4] ? data[4].replace(/[^\d]/g, '') : '0',
                    uptime: new Date().getTime() - _this._pids[pid].meta._started
                };
                                
                _this.emit('data', _this._pids[pid], data);
                
                _this._collect(_this._pids[pid], data);
                                               
                delete pids[pi];
            }
        });  
        
        return pids;
    }
}