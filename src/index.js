'use strict';

const Promise = require('bluebird');
const Action = require('./action');
const Parser = require('./parser');

// no operation step
const nop = function() {};

/**
 * helper function, handle onErr callback only once
 */
function convertToRejection(onErr) {

  return function(reason) {

    if (reason) {
      onErr(reason);
    }

    return Promise.reject();
  }
}

/**
 * local Helper function, helping to login
 * @param action class object
 * @param error callback take single error reason string
 */
function loginCheck(action, onErr) {

  return action.openPhantom()
    .then(action.createWebPage.bind(action), onErr)
    .then(action.openLoginPage.bind(action), onErr)
    .then(action.fillInLoginForm.bind(action), onErr);
}

/**
 * get AcademicHistory
 * @param action, action class object
 * @param onErr, on error callback
 * @return function return promise of phantom instance & academic report and degree audit in html
 */
function getAcademicHistory(onErr) {

  return function(action) {
    return action.openAcademicHistory()
      .then(action.getAcademicHistory.bind(action), onErr)
      .then(Parser.parseAcademicHistory.bind(action), onErr);
  };
};

/**
 * get DegreeAudit
 * @param onErr, on error callback
 * @return function return promise of phantom instance & academic report and degree audit in html
 */
 function getDegreeAuditReport(onErr) {

   return function(action) {

     return action.openDegreeAudit()
       .then(action.openDegreeAuditReport.bind(action), onErr)
       .then(action.getDegreeAuditReport.bind(action), onErr)
       .then(Parser.parseDegreeAudit.bind(action), onErr);
   };
 };

/**
 * check username, password
 * @param username
 * @param password
 * @param onErr, error callback take single error reason string
 * @param onSuccess, success callback take no argument, run after success login;
 * @param raw, if you want the raw html content
 */
exports.authenticateUser = function(username, password, onError, onSuccess) {

  let onErr = convertToRejection(onError);
  let action = new Action(username, password);

  loginCheck(action, onErr)
    .then(action.killPhantom.bind(action), onErr)
    .then(onSuccess, onErr)
    .catch(nop);
};

/**
 * get academic history
 * @param username
 * @param password
 * @param onErr, error callback take single error reason string
 * @param onSuccess, success callback, take single object contain academic history
 */
exports.getAcademicHistory = function(username, password, onError, onSuccess, raw) {

  let onErr = convertToRejection(onError);
  let action = new Action(username, password);

  loginCheck(action, onErr)
    .then(getAcademicHistory(onErr))
    .then(action.killPhantom.bind(action), onErr)
    .then(Parser.parseAcademicHistory, onErr)
    .then(Parser.parseResult(onSuccess, raw), onErr)
    .catch(nop);
};

/**
 * get Full Report
 * @param username
 * @param password
 * @param onErr, error callback take single error reason string
 * @param onSuccess, success callback, take single object contain academic history
 * @param raw, if you want the raw html content
 */
exports.getFullReport = function(username, password, onError, onSuccess, raw) {

  let onErr = convertToRejection(onError);
  let action = new Action(username, password);

  loginCheck(action, onErr)
    .then(getAcademicHistory(onErr), onErr)
    .then(getDegreeAuditReport(onErr), onErr)
    .then(action.killPhantom.bind(action), onErr)
    .then(Parser.parseAcademicHistory, onErr)
    .then(Parser.parseDegreeAudit, onErr)
    .then(Parser.parseResult(onSuccess, raw), onErr)
    .catch(nop);
}
