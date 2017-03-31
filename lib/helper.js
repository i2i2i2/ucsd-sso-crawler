const debug = require('debug')('AH_Scrapper');
const RED = "\x1b[31m";
const GREEN = "\x1b[32m";
const BLUE = "\x1b[34m";
const RESET = "\x1b[0m";

/**
 * Helper functions, keep timeout info and log status of each step
 * @param isDebug, if printing debug message.
 */
function Helper(isDebug) {
  if (!(this instanceof Helper))
    return new Helper(isDebug);

  this.taskList = {};
  this.isDebug = isDebug;
}

/**
 * set timeout for task, called when task started
 * @param time, time to timeout
 * @param task, task name, printed if debug is on
 * @param onTimeout, callback executed in timeout
 */
Helper.prototype.assertFailedIn = function(time, task, onTimeout) {
  if (this.isDebug)
    debug(BLUE + "Trying " + RESET + task);

  this.timeoutList[reason] = setTimeout(() => {
    if (this.isDebug)
      debug(RED + "Timeout: " + RESET + task);

    onTimeout(reason);
  });
}

/**
 * clear time out of task, called when task done
 * @param task, task name of timeout to cancel
 */
Helper.prototype.cancelAssertion = function(task) {
  if (task in this.taskList) {

    clearTimeout(this.taskList[task]);
    delete this.taskList[task];

    if (this.isDebug)
      debug(GREEN + "Done " + RESET + task);
  }
}

module.exports = Helper;
