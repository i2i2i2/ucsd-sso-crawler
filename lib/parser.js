const Promise = require('bluebird');
const Helper = require('./helper')('Parser');

exports.parseAcademicHistory = function(phantom) {

  return new Promise((resolve, reject) => {
    Helper.log("get Academic History");
    resolve(phantom);
  });
}

exports.parseDegreeAudit = function(phantom) {

  return new Promise((resolve, reject) => {

    Helper.log("get DegreeAudit Report");
    resolve(phantom);
  });
}

exports.parseResult = function(onSuccess) {

  return function(phantom) {

    return new Promise((resolve, reject) => {

      console.log("You should get Both");
      resolve(phantom);
    });
  };
}
