const Promise = require('bluebird');
const Action = require('./action');
const Helper = require('./helper');
const Parser = require('./parser');

/**
 * local Helper function, helping to login
 * @param username
 * @param password
 * @param error callback take single error reason string
 */
function loginCheck(username, password, onErr) {

  return Action.openPhantom()
    .catch(onErr)
    .then(Action.createWebPage)
    .catch(onErr)
    .then(Action.openLoginPage)
    .catch(onErr)
    .then(Action.fillInLoginForm(username, password))
    .catch(onErr);
}

/**
 * get AcademicHistory
 * @param onErr, on error callback
 * @return function return promise of phantom instance & academic report and degree audit in html
 */
function getAcademicHistory(onErr) {

  return function(phantom) {

    return Action.openAcademicHistory(phantom)
      .catch(onErr)
      .then(Action.getAcademicHistory)
      .catch(onErr)
      .then(Parser.parseAcademicHistory)
      .catch(onErr);
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
       .catch(onErr)
       .then(Action.openDegreeAuditReport)
       .catch(onErr)
       .then(Action.getDegreeAuditReport)
       .catch(onErr)
       .then(Parser.parseDegreeAudit)
       .catch(onErr);
   };
 };

/**
 * check username, password
 * @param username
 * @param password
 * @param onErr, error callback take single error reason string
 * @param onSuccess, success callback take no argument, run after success login;
 */
exports.authenticateUser = function(username, password, onErr, onSuccess) {

  loginCheck(username, password, onErr)
    .then(Action.killPhantom)
    .then(onSuccess);
};

/**
 * get academic history
 * @param username
 * @param password
 * @param onErr, error callback take single error reason string
 * @param onSuccess, success callback, take single object contain academic history
 */
exports.getAcademicHistory = function(username, password, onErr, onSuccess) {

  loginCheck(username, password, onErr)
    .then(getAcademicHistory(onErr))
    .then(Action.killPhantom)
    .then(Parser.parseResult(onSuccess));
};

/**
 * get Full Report
 * @param username
 * @param password
 * @param onErr, error callback take single error reason string
 * @param onSuccess, success callback, take single object contain academic history
 */
exports.getFullReport = function(username, password, onErr, onSuccess) {

  loginCheck(username, password, onErr)
    .then(getAcademicHistory(onErr))
    .then(getDegreeAuditReport(onErr))
    .then(Action.killPhantom)
    .then(Parser.parseResult(onSuccess))
    .catch(onErr);
}
