const debug = require('debug')('Scrapper');
const RED = "\x1b[31m";
const GREEN = "\x1b[32m";
const BLUE = "\x1b[34m";
const RESET = "\x1b[0m";

/**
 * Helper functions, keep timeout info and log status of each step
 * @param isDebug, if printing debug message.
 */
function Helper() {

  if (!(this instanceof Helper))
    return new Helper();

  this.taskList = {};
}

/**
 * set timeout for task, called when task started
 * @param time, time to timeout
 * @param task, task name, printed if debug is on
 * @param onTimeout, callback executed in timeout
 */
Helper.prototype.assertFailedIn = function(time, task, onTimeout, phantom) {

  debug(BLUE + "Trying " + RESET + task);

  if (time != null) {
    this.taskList[task] = setTimeout(() => {
      debug(RED + "Timeout: " + RESET + task);
      if (phantom && phantom.browser)
          phantom.browser.exit();

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

  debug((isSuccess? (GREEN + "Done ") : (RED + "Failed")) + RESET + task);
}

module.exports = Helper;
