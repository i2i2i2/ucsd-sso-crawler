const Promise = require('bluebird');
const Helper = require('./helper');

exports.parseAcademicHistory = function(phantom) {

  return new Promise((resolve, reject) => {
    console.log("get AH");
    resolve(phantom);
  });
}

exports.parseDegreeAudit = function(phantom) {

  return new Promise((resolve, reject) => {

    console.log("get DA");
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
