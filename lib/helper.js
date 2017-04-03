'use strict';

const debug = require('debug');
const RED = "\x1b[31m";
const GREEN = "\x1b[32m";
const BLUE = "\x1b[34m";
const RESET = "\x1b[0m";

/**
 * Helper functions, keep timeout info and log status of each step
 * @param isDebug, if printing debug message.
 */
function Helper(name) {

  if (!(this instanceof Helper))
    return new Helper();

  this.taskList = {};
  this.debug = debug(name? name : 'Scrapper');
}

/**
 * set timeout for task, called when task started
 * @param time, time to timeout
 * @param task, task name, printed if debug is on
 * @param onTimeout, callback executed in timeout
 */
Helper.prototype.assertFailedIn = function(time, task, onTimeout, phantom) {

  this.debug(BLUE + "Trying " + RESET + task);

  if (time != null) {
    this.taskList[task] = setTimeout(() => {
      this.debug(RED + "Timeout: " + RESET + task);
      if (phantom)
          phantom.exit();

      onTimeout("Fail " + task);
    }, time);
  }
}

/**
 * clear time out of task, called when task done
 * @param task, task name of timeout to cancel
 * @param isSuccess, if task completed, or rejected
 */
Helper.prototype.cancelAssertion = function(task, isSuccess) {

  if (task in this.taskList) {
    clearTimeout(this.taskList[task]);
    delete this.taskList[task];
  }

  this.debug((isSuccess? (GREEN + "Done ") : (RED + "Failed")) + RESET + task);
}

/**
 * log debug
 * @param string to log
 */
Helper.prototype.log = function(str) {

  this.debug(str);
}

module.exports = Helper;
