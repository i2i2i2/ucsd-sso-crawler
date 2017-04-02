'use strict';

const Promise = require('bluebird');
const Action = require('./action');
const Helper = require('./helper');
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
 * @param username
 * @param password
 * @param error callback take single error reason string
 */
function loginCheck(username, password, onErr) {

  return Action.openPhantom()
    .then(Action.createWebPage, onErr)
    .then(Action.openLoginPage, onErr)
    .then(Action.fillInLoginForm(username, password), onErr);
}

/**
 * get AcademicHistory
 * @param onErr, on error callback
 * @return function return promise of phantom instance & academic report and degree audit in html
 */
function getAcademicHistory(onErr) {

  return function(phantom) {

    return Action.openAcademicHistory(phantom)
      .then(Action.getAcademicHistory, onErr)
      .then(Parser.parseAcademicHistory, onErr);
  };
};

/**
 * get DegreeAudit
 * @param onErr, on error callback
 * @return function return promise of phantom instance & academic report and degree audit in html
 */
 function getDegreeAuditReport(onErr) {

   return function(phantom) {

     return Action.openDegreeAudit(phantom)
       .then(Action.openDegreeAuditReport, onErr)
       .then(Action.getDegreeAuditReport, onErr)
       .then(Parser.parseDegreeAudit, onErr);
   };
 };

/**
 * check username, password
 * @param username
 * @param password
 * @param onErr, error callback take single error reason string
 * @param onSuccess, success callback take no argument, run after success login;
 */
exports.authenticateUser = function(username, password, onError, onSuccess) {

  let onErr = convertToRejection(onError);

  loginCheck(username, password, onErr)
    .then(Action.killPhantom, onErr)
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
exports.getAcademicHistory = function(username, password, onError, onSuccess) {

  let onErr = convertToRejection(onError);

  loginCheck(username, password, onErr)
    .then(getAcademicHistory(onErr))
    .then(Action.killPhantom, onErr)
    .then(Parser.parseResult(onSuccess), onErr)
    .catch(nop);
};

/**
 * get Full Report
 * @param username
 * @param password
 * @param onErr, error callback take single error reason string
 * @param onSuccess, success callback, take single object contain academic history
 */
exports.getFullReport = function(username, password, onError, onSuccess) {

  let onErr = convertToRejection(onError);

  loginCheck(username, password, onErr)
    .then(getAcademicHistory(onErr), onErr)
    .then(getDegreeAuditReport(onErr), onErr)
    .then(Action.killPhantom, onErr)
    .then(Parser.parseResult(onSuccess), onErr)
    .catch(nop);
}
