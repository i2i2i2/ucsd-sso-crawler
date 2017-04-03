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
        parsed.generalInfo[field] = $(element).find('td')[1].textContent;
    });

    // get cumulative summary
    parsed.gradeOptions = {};
    let gradeOptions = [null, 'letter', 'pnp', 'all'];
    let creditFields = [null, 'attendCredit', 'passedCredit', 'gpaCredit', 'sumGPA', 'avgGPA'];

    $('#gradeOption').find('tr').each(function(index, row) {

      if (!gradeOptions[index])
        return true;

      let option = parsed.gradeOptions[index] = {};
      $(row).find('td').each(function(index, col) {

        if (!creditFields[index])
          return true;

        option[creditFields[index]] = col.textContent;
      });
    });

    // get transfer credits
    parsed.transferCredits = [];
    let transferFields = ['subject', 'course', 'title', 'unit', 'grade', 'term', 'level', 'ucsdEquiv'];
    let transfers = $('#transferCourses').find('tr[valign=top]');
    for (var idx = 1; idx < transfers.length; idx++) {

      let transfer = {};
      $(transfers[idx]).find('td').each(function(index, element) {

        if (index == 3) {
          transfer[transferFields[index]] = element.textContent
            .replace(/([A-Z])/g, ' $1')
            .split(' ')
            .filter(str => str.length)
            .join(' ');

        } else if (index == 6) {
          transfer[transferFields[index]] = element.textContent.replace(/\s\s*$/, '');

        } else if (index == 7) {
          transfer[transferFields[index]] = element.textContent
            .split('\n')
            .filter(term => /\S+\ \S+/.test(term))
            .map(str => str.replace(/^\s\s*/, '').replace(/\s\s*$/, ''));

        } else {
          transfer[transferFields[index]] = element.textContent;
        }
      });

      parsed.transferCredits.push(transfer);
    }

    // get 
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
