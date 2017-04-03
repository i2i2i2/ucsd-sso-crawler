'use strict';

const Promise = require('bluebird');
const Helper = require('./helper')('Parser');
const cheerio = require('cheerio')

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

    $('#gradeOption').children('tr').each(function(index, row) {

      if (!gradeOptions[index])
        return true;

      let option = parsed.gradeOptions[index] = {};
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
