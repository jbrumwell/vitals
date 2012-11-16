var assert = require("should"),
    health = require('../')({
        interval: 300
    });

describe('Health Monitor', function(){  
    describe('Object', function(){
        it('is an object', function(){
            assert.equal('object', typeof health, 'health is not an object');
        });
         
        it('should have a length property', function() {
            assert.exists(health.length, 'health does not have a length property')
        });                                
    
        describe('Adding Processes', function() {
            beforeEach(function() {                
                health.remove();
            });
            
            it('should have a add function', function() {
                assert.equal('function', typeof health.remove);
            })
      
            it('should add via number', function() {
                health.add(process.pid);
          
                assert(health.length);
            });
      
            it('should add via number with meta data', function() {
                health.add(process.pid, {custom: 'meta'});                    
            })
      
            it('should add via object', function() {
                health.add({
                    pid: process.pid
                });
          
                assert(health.length);
            })
      
            it('should add via object with meta', function() {
                health.add({
                    pid: process.pid,
                    meta: {
                        custom: 'meta'
                    }
                });
          
                assert(health.length);
            })
        
            it('should add via array', function() {
                health.add([process.pid]);          
                assert(health.length);                    
            });  
      
            it('should add via array of object', function() {
                health.add([
                    {pid: process.pid}
                ]);
                                          
                assert(health.length);
            })
        
            it('should add via array of objects with meta', function() {
                health.add([
                    {pid: process.pid, meta: {custom: 'meta'}},
                    {pid: 2, meta: {custom: 'meta2'}},
                ]);
            
                assert.equal(2, health.length);
            })
      
            it('should increase the length property when pid is added', function() {
                assert.equal(0, health.length);
          
                health.add(process.pid);
        
                assert.equal(1, health.length);
            });
      
            it('should not add duplicates', function() {
                health.add(process.pid);
                assert(1, health.length);
                health.add(process.pid);
                assert(1, health.length);
            })
            
            it('should emit added on add', function(done) {
                health.on('added', function(proc) {
                    assert.equal('object', typeof proc);
                    assert.exists(proc.pid);
                    assert.equal('object', typeof proc.meta);
                    health.removeAllListeners('added');
                    done();
                })
                
                health.add(process.pid);
            })
      
            after(function() {
                health.remove();
            })
        })
  
        describe('Removing Processes', function() {
            beforeEach(function() {
                health.remove();
                health.add([1,2,3,4,5, {pid: 6, meta: {custom: 'meta'}}]);
            });
            
            it('should have a remove function', function() {
                assert.equal('function', typeof health.remove);
            })
            
            it('should remove by id', function() {
                health.remove(4);
          
                assert.equal(5, health.length);                    
            })
        
            it('should decrease the length on removal', function() {
                assert.equal(6, health.length);
          
                health.remove(4);
          
                assert.equal(5, health.length);
            });                   
      
            it('should remove by an array of ids', function() {
                health.remove([4, 2]);
            
                assert.equal(4, health.length);                    
            })
      
            it('should remove by filtering process id', function() {
                health.remove(function(proc) {
                    return proc.pid < 3;
                })
          
                assert.equal(2, health.length);
            })
      
            it('should remove by filtering process meta', function() {                   
                health.remove(function(proc) {
                    return proc.meta.custom != 'meta';
                })
          
                assert.equal(5, health.length);
            }) 
            
            it('should remove by all', function() {                   
                health.remove()
          
                assert.equal(0, health.length);
            }) 
            
            it('should emit removed on remove', function(done) {
                health.on('removed', function(proc) {
                    assert.equal('object', typeof proc)
                    assert.equal('object', typeof proc.meta);
                    assert.exists(proc.pid);                    
                    health.removeAllListeners('removed');
                    done();
                })
                
                health.remove(6);
            })
        
            after(function() {
                health.remove();
            });
        })
  
        describe('Getting Processes', function() {
            beforeEach(function() {
                health.remove();
                health.add([1,2,3,4,5, {pid: 6, meta: {custom: 'meta'}}]);
            });
            
            it('should have a get function', function() {
                assert.equal('function', typeof health.get);
            })
      
            it('should get by id', function() {
                health.get(4, function(proc) {
                    assert.equal(proc.pid, '4');
                });
            })
      
            it('should provide both pid and meta', function() {
                health.get(6, function(proc) {
                    assert.exists(proc.pid);
                    assert.equal('meta', proc.meta.custom);
                });
            })
      
            it('should get by an array of ids', function() {
                health.get([4, 2], function(pids) {
                    //[{pid, meta}, ...]
                    assert(Array.isArray(pids));
                    assert.equal(pids.length, 2);
                    assert.equal('object', typeof pids[0]);
                    assert.exists(pids[0].pid);
                    assert(pids[0].pid == 2 || pids[1].pid == 2);
                    assert(pids[0].pid == 4 || pids[1].pid == 4);            
                });
            })
      
            it('should provide a meta object, when called by array', function() {
                health.get([4,6], function(pids) {              
                    assert.exists(pids[0].meta);
                    assert.exists(pids[1].meta);
                });
            })
      
            it('should get by filtering pid', function() {
                health.get(function(proc) {
                    return proc.pid > 3;
                }, function(pids) {
                    assert(Array.isArray(pids));
                    assert.equal(3, pids.length);  
                })                    
            })
      
            it('should get by filtering meta', function() {
                health.get(function(proc) {
                    return proc.meta.custom == 'meta';
                }, function(pids) {
                    assert(Array.isArray(pids));
                    assert.equal(1, pids.length);  
                })                    
            })
        
            it('should allow for both callback and non-callback style', function() {
                health.get(4, function(proc) {
                    var obj = health.get(4);
              
                    assert.equal(obj.pid, proc.pid);
                    assert.equal(JSON.stringify(obj.meta), JSON.stringify(proc.meta));
                });                    
            })
      
            after(function() {
                health.remove();
            });
        }) 
    })
    
    describe('Monitoring', function() {
        describe('starting', function() {
            before(function() {
                health.add(process.pid, {custom: 'meta'});
            });
            
            it('should have a start function', function() {
                assert.equal('function', typeof health.start);
            })
            
            it('should emit#started', function(done) {              
               health.on('started', function() { 
                   health.stop();
                   health.removeAllListeners('started'); 
                   done();
               }); 
               
               health.start();
            });
                                    
            it('should emit#data on cycle', function(done) {                                                
                health.on('data', function(proc, data) {
                    health.removeAllListeners('data'); 
                    done();
                });    
                
                health.start();                                
            })
                                    
            after(function() {
                health.remove();
            })
        })
        
        describe('Emitted Data', function() {
            before(function() {
                health.add(process.pid, {custom: 'meta'});
            });
            
            beforeEach(function() {
                health.start();
            })
            
            it('should emit#data that contains uptime, cputime and memory usage', function(done) {                
                health.on('data', function(proc, data) {
                    assert.exists(proc);
                    assert.exists(proc.pid);
                    assert.exists(proc.meta);
                    assert.exists(data.cputime);
                    assert.exists(data.uptime);
                    assert.exists(data.memoryUsage);                                       
                    done();
                });
            })
            
            it('should emit#data that contains process meta data', function(done) {               
                health.on('data', function(proc, data) {
                    assert.exists(proc.meta.custom);    
                    assert.equal('meta', proc.meta.custom);
                    done();
                });
            })
            
            afterEach(function() {
                health.removeAllListeners('data');
                health.stop();
            })  
            
            after(function() {
                health.remove();
            })
        })
        
        describe('Data Sampling', function() {
            before(function() {                
                health.options.sampleRate = 1;                
            });
            
            beforeEach(function() {
                health.add(process.pid, {custom: 'meta'});
                health.start();
            })
            
            it('should provide sample data', function(done) {
                health.on('data', function(proc, data) {
                    assert.exists(proc.meta._samples);
                    assert.equal(1, proc.meta._samples.length);
                    done();                    
                })
            })
            
            it('should emit#data that contains uptime, cputime, memory usage and timestamp when collected', function(done) {          
                health.on('data', function(proc, data) {
                    assert.exists(proc.meta._samples);
                    assert.exists(proc.meta._samples[0].cputime);
                    assert.exists(proc.meta._samples[0].uptime);
                    assert.exists(proc.meta._samples[0].memoryUsage); 
                    assert.exists(proc.meta._samples[0].collected); 
                    done();
                })
            })
            
            it('should adhere to the max sampling rate', function(done) {
                var count = 0,
                    until = 10;
                
                health.options.maxSamples = 3;
                
                this.timeout(10000);
                
                health.on('data', function(proc, data) {                                            
                    ++count;
                    
                    assert.exists(proc.meta._samples);
                    assert.equal(count > 3 ? 3 : count, proc.meta._samples.length);                   

                    if (count >= until) {
                         assert(count > proc.meta._samples.length);
                         done();
                    }                    
                })
            })                        
            
            afterEach(function() {
                health.removeAllListeners('data');
                health.remove();
                health.stop();
            }) 
            
            after(function() {
                health.remove();
            })
        });
        
        describe('Stopping', function() {
            before(function() {
                health.add(process.pid, {custom: 'meta'});                                
            });
            
            it('should have a stop method', function() {
                assert.equal('function', typeof health.stop);
            })
            
            it('should stop monitoring on stop', function(done) {                
                var called = false;
                
                health.on('stopped', function() {
                    called = true;
                    
                    setTimeout(function() {
                        done();
                    }, 1500);
                });
                
                
                health.on('data', function() {
                    if (called) {
                        done('was called twice');
                    }
                    
                    called = true;
                    
                    health.stop();
                })                                 
                
                health.start();                                
            })
            
            it('should emit#stopped', function(done) {               
                health.start();
                
                 health.on('stopped', function() {
                     done();
                 });                                    
                 
                 health.stop();
            });
            
            after(function() {
                health.remove();
            })
        })
    })
})



