# Vitals

  Vitals is a module that will collect health statistics for process ids past to it, currently collections cpu time, memory usage and uptime. 

## Installation

    $ npm install vitals


## Features

  - Windows & Unix support  
  - Meta data support  
  - Data sampling

## Options

  - `interval` the interval in which to poll the processes (Default 3000ms)
  - `maxSamples` the maximum number of samples to retain
  - `sampleRate` the rate at which to sample data between 0 (disabled) and 1 for 100%, ie: 0.15 for 15% of the time

## Events

  - `started` when the monitor is activated
  - `stopped` when the monitor has stopped monitoring the processes
  - `added` when a process has been added to the monitor
  - `removed` when a process has been removed from the monitor, died will be in the meta data if removed due to process stopping
  - `data` the processes health data

## Usage

Initiate vitals and add processes

```js
var vitals = require('vitals');
```

Adding processes to vitals

```js
vitals.add(pid, [meta]);

vitals.add([
    {pid: pid, meta: meta}
])
```

Getting monitored processes

```js
var proc = vitals.get(pid);
var procs = vitals.get([pid,pid]);
var procs = vitals.get(function(proc) {
                    return proc.meta.key == 'value';
                });
```

Removing processes to vitals

```js
vitals.remove(pid);

vitals.remove([pid, pid, pid]);

vitals.remove(function(proc) {
    return proc.meta.key = 'value';
})

vitals.remove(); //removes all
```

Starting / Stopping

```js
vitals.start();

vitals.stop();
```

Count number of processes being monitored

```js
vitals.length
```

Sampling Data

```js
vitals.on('data', function(proc, data) {
    //proc.meta._samples == Array[data, data, data]
    //data.collected is the time the sample was collected
});

var proc = vitals.get(pid);

proc.meta._samples
```

Events

```js
vitals.on('started', function() {
    
});

vitals.on('added', function(proc) {
    //proc.pid && proc.meta
});

vitals.on('removed', function(proc) {
    //proc.pid && proc.meta && proc.meta.died if process exited
})

vitals.on('data', function(proc, data) {
    //proc.pid && proc.meta
    //data.cputime data.memoryUsage data.uptime
});

vitals.on('stopped', function() {
    
});
```

## Running tests

```
$ npm install
$ npm test
```

## License

(The MIT License)

