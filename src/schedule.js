#!/usr/bin/env node

/**
* DISCLAIMER
*
* I do not actually know any javascript. At All. Never seen it before.
* This code may break. It may already be broken. I don't know how to fix it.
* I wrote it, it kind of worked. That's the limit of my JS knowledge.
*/

'use strict'

// Require the fs module to save to filesystem
var fs = require('fs');

// This is where we will store the schedule
// TODO sqlite or some other storage DB
var SCHEDULE_DIR = __dirname + '/../sched';
var SCHEDULE_LOCATION = SCHEDULE_DIR + '/schedule.json';

// Export the module name
module.exports = Schedule;

/**
 * Constructor
 */
function Schedule() {}

/**
  SCHEDULE

  {
   "request" :
   [
      {
        "user" : <user_id>,
        "place" : <place>,
        "date" : <date>,
        "start" : <start_time>,
        "end" : <end_time>
      }
   ]
   "provide" :
   [
      {
        "user" : <user_id>,
        "who" : <who_user_id>,
        "place" : <place>,
        "date" : <date>,
        "start" : <start_time>,
        "end" : <end_time>
      }
   ]

  }

  "request" will hold an array of coverage requests.
  Each request will have the user who requested as well as a location to cover,
  date of coverage, and time frame

  "provide" will hold an array of coverage provides.
  Each provide will have the user who is providing, the user they are providing
  for, the place, date, and time frame


  */

/**
* Request coverage for a given user at a place, date, time
*/
Schedule.prototype.requestCoverage = function(user, place, date, start, end) {
  console.log("About to update schedule...");

  // Make dir if it does not exist
  fs.mkdirSync(SCHEDULE_DIR);

  // Touch the file
  fs.closeSync(fs.openSync(SCHEDULE_LOCATION, 'a'));

  fs.readFile(SCHEDULE_LOCATION, function(err, data) {
    if (err) {
      console.error('Error loading schedule JSON into memory.');
      return callback(err);
    }

    console.log('Parsing schedule JSON');
    var stringData = data.toString();
    if (!(stringData !== '' && typeof stringData !== 'undefined')) {
      console.log("File is empty");
      fs.writeFile(SCHEDULE_LOCATION, "{}", function(err) {

        if (err) {
          console.error('Error while writing new schedule.');
          return callback(err);
        }
      });
    }
  });
};

// vim: set syntax=javascript tabstop=2 softtabstop=2 shiftwidth=2 shiftround expandtab:
