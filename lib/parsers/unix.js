module.exports = function() {
    this._command = 'ps axo pid,time,rss';
    
    this._parse = function(error, stdout, stderr) {
        var lines = stdout.split('\n'),
            _this = this,
            pids  = Object.keys(this._pids);

        lines.forEach(function(line) {
            var trimmed = line.trim().replace(/\s+/g, ' '),
                data    = trimmed && trimmed.split(' ') || [],
                pid     = data[0],
                pi      = pids.indexOf(pid);
            
            
            if (pid &&  pi !== -1) {                
                data = {
                    cputime: data[1].replace(':', '').replace(':', '.'),
                    memoryUsage: data[2] ? data[2].replace(/[^\d]/g, '') : '0',
                    uptime: new Date().getTime() - _this._pids[pid].meta._started
                };
                
                _this.emit('data', _this._pids[pid], data)
                
                _this._collect(_this._pids[pid], data);
               
                delete pids[pi];
            }
        })
        
        return pids;
    }
}