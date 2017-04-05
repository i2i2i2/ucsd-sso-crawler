'use strict';

const Promise = require('bluebird');
const Helper = require('./helper')('Parser');
const cheerio = require('cheerio')

/**
 * parse academic history
 * @param phantom, object includes AcademicHistory fields to parseAcademicHistory
 * @return promise phantom contains parsed JSON.
 */
exports.parseAcademicHistory = function(phantom) {

  return new Promise((resolve, reject) => {

    let $ = cheerio.load(phantom.AcademicHistory);
    let parsed = {};

    // get general info
    parsed.generalInfo = {};
    let generalInfoFields = ['name', 'pid', 'level', 'college', 'major', 'degree'];

    $('#generalInformation').find('tr').each(function(index, element) {

      let field = generalInfoFields[index];
      if (field)
        parsed.generalInfo[field] = $($(element).children('td')[1]).text();
    });

    // get cumulative summary
    parsed.gradeOptions = {};
    let gradeOptions = [null, 'letter', 'pnp', 'all'];
    let creditFields = [null, 'attendCredit', 'passedCredit', 'gpaCredit', 'sumGPA', 'avgGPA'];

    $('#gradeOption').find('tr').each(function(index, row) {

      if (!gradeOptions[index])
        return true;

      let option = parsed.gradeOptions[gradeOptions[index]] = {};
      $(row).children('td').each(function(index, col) {

        if (!creditFields[index])
          return true;

        option[creditFields[index]] = $(col).text();
      });
    });

    // get transfer credits
    parsed.transferCredits = [];
    let transferFields = ['subject', 'course', 'title', 'unit', 'grade', 'term', 'level', 'ucsdEquiv'];
    let transfers = $('#transferCourses').find('tr[valign=top]');
    for (var idx = 1; idx < transfers.length; idx++) {

      let transferCredit = {};
      $(transfers[idx]).children('td').each(function(index, element) {

        if (index == 3) {
          transferCredit[transferFields[index]] = $(element)
            .text()
            .replace(/([A-Z])/g, ' $1')
            .split(' ')
            .filter(str => str.length)
            .join(' ');

        } else if (index == 6) {
          transferCredit[transferFields[index]] = $(element).text().replace(/\s\s*$/, '');

        } else if (index == 7) {
          transferCredit[transferFields[index]] = $(element)
            .text()
            .split('\n')
            .filter(term => /\S+\ \S+/.test(term))
            .map(str => str.replace(/^\s\s*/, '').replace(/\s\s*$/, ''));

        } else {
          transferCredit[transferFields[index]] = $(element).text();
        }
      });

      parsed.transferCredits.push(transferCredit);
    }

    // get courses of each term
    parsed.ucsdCredits = {};
    let courseFields = ['subject', 'course', 'title', 'units', 'grade', 'pointsRepeat'];
    $('.bold.term_hilite').each(function(index, element) {

      let term = $(element)
        .text()
        .replace(/^\s\s*/, '')
        .replace(/\s\s*$/, '')
        .replace(/\ /g, '')
        .substr(7);

      let courseInTerm = parsed.ucsdCredits[term] = [];

      $(element).next().find('tr[valign=top]').each(function(index, element) {

        let course = {};

        $(element).children('td').each(function(index, element) {

          if (!courseFields[index])
            return;

          if (index == 1 || index == 2 || index == 4) {
            course[courseFields[index]] = $(element)
              .contents()
              .filter(function() {return this.nodeType == 3})
              .text()
              .replace(/^\s\s*/, '')
              .replace(/\s\s*$/, '');

          } else {
            course[courseFields[index]] = $(element).text();
          }
        });

        courseInTerm.push(course);
      });
    });

    phantom.report = parsed;
    resolve(phantom);
  });
}

/**
 * parse degree audit to find out stll required course. TODO: To irregular
 * @param phantom, object includes DegreeAudit field to parseAcademicHistory
 * @return promise phantom contains parsed JSON.
 */
exports.parseDegreeAudit = function(phantom) {

  return new Promise((resolve, reject) => {

    // TODO: parse required but completed classes in DegreeAudit report
    if (phantom.report) {
      phantom.report.degreeAudit = phantom.DegreeAudit;

    } else {
      phantom.report = {
        degreeAudit: phantom.DegreeAudit
      };
    }

    resolve(phantom);
  });
}

/**
 * turn onSuccess to promise
 * @param onSuccess, success callback, takes on arg the parsed academic history JSON
 * @param raw, if you want raw html
 * @return function that return promise, inside promise success back is called
 */
exports.parseResult = function(onSuccess, raw) {

  return function(phantom) {

    return new Promise((resolve, reject) => {

      if (raw) {
        onSuccess({
          academicHistory: phantom.AcademicHistory,
          degreeAudit: phantom.DegreeAudit
        });

      } else {
        onSuccess(phantom.report);
      }

      resolve(phantom);
    });
  };
}
