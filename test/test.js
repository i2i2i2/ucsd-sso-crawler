const Scrapper = require("../lib/index.js");

Scrapper.getFullReport(
  '***',
  '***',
  console.log,
  function() {
    console.log('success');
  }
);
