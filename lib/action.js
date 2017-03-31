const Promise = require('bluebird');
const Driver = require('node-phantom-simple');
const Helper = require('./helper');

// url constants
const SSO_LOGIN_URL = 'https://a4.ucsd.edu/tritON/Authn/UserPassword';
const TRITONLINK_URL = 'http://mytritonlink.ucsd.edu/';
const TRITONLINK_LOGINED_URL = 'https://act.ucsd.edu/myTritonlink20/display.htm';
const DEGREEAUDIT_URL = 'https://act.ucsd.edu/studentDars/select';
const DEGREEAUDIT_REPORT_URL = 'https://act.ucsd.edu/studentDars/view';
const ACADEMIC_HISTORY_URL = 'https://act.ucsd.edu/studentAcademicHistory/academichistorystudentdisplay.htm'

// task name
const TASKS = [
  'Open Phantom Instance',
  'Create Webpage',
  'Open Login Page',
  'Login to SSO'
];

/**
 * local helper Check if right page is open
 * @param page, phantom instance to check with, including browser & page
 * @param url, url to validate
 * @param task, current task name
 * @param reject, promise, reject callback
 * @param resolve, promise resolve callback
 */
function checkSuccess(phantom, url, task, reject, resolve) {

  phantom.pages[0].get("url", function(err, openedUrl) {

    if (err) {
      Helper.cancelAssertion(task, false);
      reject("Failed " + task);

    } else if (url == openedUrl) {
      Helper.cancelAssertion(task, true)
      resolve(phantom);
    }
  });
}

/**
 * Open phantom instance, using node-phantom-simple
 * @return promise of a phantom instance include browser instance
 */
exports.openPhantom = () => {

  return new Promise((resolve, reject) => {

    driver.create({}, (err, browser) => {

      if (err) {
        Helper.cancelAssertion(TASKS[0], false);
        reject({
          reason: "Failed " + TASKS[0]
        });

      } else {
        Helper.cancelAssertion(TASKS[0], true);
        resolve({
          browser: browser
        });
      }
    })

    Helper.assertFailedIn(null, TASKS[0], reject);
  });
};

/**
 * Create webpage using phanton instance
 * @param Phantom, Phantom instance, including browser & pages array
 * @return promise of combination of phantom & webpage
 */
exports.createWebPage = (phantom) => {

  return new Promise((resolve, reject) => {

    phantom.browser.createPage((err, page) => {

      if (err) {
        Helper.cancelAssertion(TASKS[1], false);
        reject("Failed " + TASKS[1]);

      } else {
        Helper.cancelAssertion(TASKS[1], true);
        resolve({
          browser: phantom.browser,
          pages: [page]
        });
      }
    });

    Helper.assertFailedIn(null, TASKS[1], reject);
  });
};

/**
 * Open mytritonlink page
 * @param Phantom, Phantom instance, including browser & pages array
 * @return promise of combination of phantom & webpage
 */
exports.openLoginPage = (phantom) => {

  return new Promise((resolve, reject) => {

    // define onload behavior check if w
    phantom.pages[0].onLoadFinished = checkSuccess(phantom, SSO_LOGIN_URL, TASKS[2], reject, resolve);
    phantom.pages[0].open(TRITONLINK_URL);

    Helper.assertFailedIn(5000, TASKS[2], reject);
  });
};

/**
 * Fill in Login Form
 * @param Phantom, Phantom instance, including browser & pages array
 * @return promise of combination of phantom & webpage
 */
exports.fillInLoginForm = (phantom, username, password) => {

  phantom.pages[0].onLoadFinished = null;

  return new Promise((resolve, reject) => {

    phantom.pages[0].onUrlChanged = (url) => {

      if (url == TRITONLINK_LOGINED_URL) {
        phantom.pages[0].onUrlChanged = null;
        Helper.cancelAssertion(TASKS[3], true);
        resolve(phantom);
      }
    }

    phantom.pages[0].evaluateJavaScript( 'function() {'
      + 'document.getElementById("ssousername").value = \'' + username + '\';'
      + 'document.getElementById("ssopassword").value = \'' + password + '\';'
      + 'document.getElementsByClassName("sso-button")[0].click();'
    + '}');

    Helper.assertFailedIn(2000, TASKS[3], reject);
  });
};

/**
 * open Degree Audit
 * @param Phantom, Phantom instance, including browser & pages array
 * @return promise of combination of phantom & webpage
 */
