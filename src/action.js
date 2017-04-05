'use strict';

const Promise = require('bluebird');
const Driver = require('node-phantom-simple');
const Helper = require('./helper');

// no operation set
const nop = function() {};

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
  'Login to SSO',
  'Open Degree Audit Page',
  'Open Degree Audit Report',
  'Get Degree Audit Report Content',
  'Open Academic History Page',
  'Get Academic History Content',
  'Kill Phantom Instance'
];


/**
 * constructor
 * contain phantom instance, pages, helper
 */
var Action = function(username, password) {

  if (!(this instanceof Action))
    return new Action(username, password);

  this.phantom = null;
  this.pages = null;
  this.username = username;
  this.password = password;
  this.helper = new Helper('Crawler ' + username);
}

/**
 * Open phantom instance, using node-phantom-simple
 * @return promise of a phantom instance include browser instance
 */
Action.prototype.openPhantom = function() {

  let self = this;

  return new Promise((resolve, reject) => {

    let phantomjs;
    try {
    	phantomjs = require('phantomjs-prebuilt');
    	self.helper.log('Loading Phantom from phantomjs-prebuilt');

    } catch (err) {
    	phantomjs = {};
      self.helper.log('Loading Phantom from Local Install');
    }

    Driver.create({
    	interval: 50,
    	weak: true,
    	loadImages: false,
    	sslProtocol: 'any',
    	switchToNewTab: false,
    	phantomPath: phantomjs.path

    }, (err, browser) => {

      if (err) {
        self.helper.cancelAssertion(TASKS[0], false);
        reject("Failed " + TASKS[0]);

      } else {
        self.helper.cancelAssertion(TASKS[0], true);
        self.phantom = browser;
        resolve(self);
      }
    })

    self.helper.assertFailedIn(null, TASKS[0], reject);
  });
};

/**
 * Create webpage using phanton instance
 * @param Phantom, Phantom instance, including browser & pages array
 * @return promise of combination of phantom & webpage
 */
Action.prototype.createWebPage = function() {

  let self = this;

  return new Promise((resolve, reject) => {

    self.phantom.createPage((err, page) => {

      if (err) {
        self.helper.cancelAssertion(TASKS[1], false);
        self.phantom.exit();
        reject("Failed " + TASKS[1]);

      } else {

        page.clearMemoryCache((err) => {
          self.helper.cancelAssertion(TASKS[1], true);
          self.pages = [page];
          resolve(self);
        })
      }
    });

    self.helper.assertFailedIn(null, TASKS[1], reject, self.phantom);
  });
};

/**
 * Open mytritonlink page
 * @param Phantom, Phantom instance, including browser & pages array
 * @return promise of combination of phantom & webpage
 */
Action.prototype.openLoginPage = function() {

  let self= this;

  return new Promise((resolve, reject) => {

    // define onload behavior check if w
    self.pages[0].onLoadFinished = self.checkSuccess(self.pages[0], SSO_LOGIN_URL, TASKS[2], reject, resolve);
    self.pages[0].open(TRITONLINK_URL);

    self.helper.assertFailedIn(10000, TASKS[2], reject, self.phantom);
  });
};

/**
 * Fill in Login Form
 * @param username, login username
 * @param password, login password
 * @return promise of combination of phantom & webpage
 */
Action.prototype.fillInLoginForm = function() {

  let self = this;

  return new Promise((resolve, reject) => {

    self.pages[0].onUrlChanged = (url) => {

      if (url == TRITONLINK_LOGINED_URL) {
        self.pages[0].onUrlChanged = nop;
        self.helper.cancelAssertion(TASKS[3], true);
        resolve(self);
      }
    }

    self.pages[0].evaluateJavaScript( 'function() {'
      + 'document.getElementById("ssousername").value = \'' + self.username + '\';'
      + 'document.getElementById("ssopassword").value = \'' + self.password + '\';'
      + 'document.getElementsByClassName("sso-button")[0].click();'
    + '}');

    self.helper.assertFailedIn(10000, TASKS[3], reject, self.phantom);
  });
};

/**
 * open Degree Audit
 * @param Phantom, Phantom instance, including browser & pages array
 * @return promise of combination of phantom & webpage
 */
Action.prototype.openDegreeAudit = function() {

  let self = this;

  return new Promise((resolve, reject) => {

    self.pages[0].onLoadFinished = self.checkSuccess(self.pages[0], DEGREEAUDIT_URL, TASKS[4], reject, resolve);
    self.pages[0].open(DEGREEAUDIT_URL);

    self.helper.assertFailedIn(10000, TASKS[4], reject, self.phantom);
  });
};

/**
 * open Degree Audit report
 * @param Phantom, Phantom instance, including browser & pages array
 * @return promise of combination of phantom & webpage
 */
Action.prototype.openDegreeAuditReport = function() {

  let self = this;

  return new Promise((resolve, reject) => {

    self.pages[0].onPageCreated = self.checkSuccess(self.pages[0], DEGREEAUDIT_REPORT_URL, TASKS[5], reject, resolve, true);
    self.pages[0].evaluateJavaScript('function() {'
      + 'var form = document.getElementById("unReport").form;'
      + 'form.target = "TritonLink2";'
      + 'form.submit();'
    + '}');

    self.helper.assertFailedIn(10000, TASKS[5], reject, self.phantom);
  });
};

/**
 * get Degree Audit report content
 * @param Phantom, Phantom instance, including browser & pages array
 * @return promise of html degree audit report content
 */
Action.prototype.getDegreeAuditReport = function() {

  return new Promise(this.getContent(1, TASKS[6], 'DegreeAudit'));
}

/**
 * open Academic history page
 * @param Phantom, Phantom instance, including browser & pages array
 * @return promise of combination of phantom & webpage
 */
Action.prototype.openAcademicHistory = function() {

  let self = this;

  return new Promise((resolve, reject) => {

    self.pages[0].onLoadFinished = self.checkSuccess(self.pages[0], ACADEMIC_HISTORY_URL, TASKS[7], reject, resolve);
    self.pages[0].open(ACADEMIC_HISTORY_URL);

    self.helper.assertFailedIn(10000, TASKS[7], reject, self.phantom);
  });
}

/**
 * get Academic history content
 * @param Phantom, Phantom instance, including browser & pages array
 * @return promise of html Academic history content
 */
Action.prototype.getAcademicHistory = function() {

  return new Promise(this.getContent(0, TASKS[8], 'AcademicHistory'));
}

/**
 * Kill phantom instance
 * @param Phantom, Phantom instance, including browser & pages array
 */
Action.prototype.killPhantom = function() {

  let self = this;

  return new Promise((resolve, reject) => {
    if (self.phantom) {
      self.phantom.exit();

      delete self.phantom;
      delete self.pages;
    }

    resolve(self);
  });
}

/**
 * local helper Check if right page is open
 * @param page, phantom instance to check with, including browser & page
 * @param url, url to validate
 * @param task, current task name
 * @param reject, promise, reject callback
 * @param resolve, promise resolve callback
 */
Action.prototype.checkSuccess = function(page, url, task, reject, resolve, isNewPage) {

  let self = this;

  return function(newPage) {

    if (isNewPage) {
      newPage.onLoadFinished = self.checkSuccess(newPage, url, task, reject, resolve, false);
      self.pages.push(newPage);
      page.onPageCreated = nop;

    } else {
      page.get("url", function(err, openedUrl) {

        self.helper.log(openedUrl);

        if (err) {
          self.helper.cancelAssertion(task, false);
          if (self.phantom)
            self.phantom.exit();

          reject("Failed " + task);

        } else if (url == openedUrl) {
          page.onLoadFinished = nop;

          self.helper.cancelAssertion(task, true);
          resolve(self);
        }
      });
    }
  };
};

/**
 * local helper get html content
 * @param pageNum, what page the content on
 * @param task, task name
 * @param phantom, phantom instance include browser & pages
 * @param storeAs, variable name to pass on
 */
Action.prototype.getContent = function(pageNum, task, storeAs) {

  var self = this;

  return (resolve, reject) => {

    self.pages[pageNum].get("content", (err, content) => {

      if (err) {
        self.helper.cancelAssertion(task, false);
        self.phantom.exit();

        reject("Failed" + task);

      } else {
        self.helper.cancelAssertion(task, true);
        self[storeAs] = content;
        resolve(self);
      }
    });

    self.helper.assertFailedIn(null, task, reject);
  }
};

module.exports = Action;
