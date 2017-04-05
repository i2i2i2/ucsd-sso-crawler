# ucsd-sso-crawler

A stupid way to crawl into UCSD student SSO, using phantomjs to automate the process of login.

I would really appreciate if someone could tell me the way to login to UCSD student SSO, using only http request, respond without the heavy phantomjs instance.

## Example

### Verify UCSD student credential

```js

// Uncomment below the line to enable debug print
// or run `DEBUG=* node index` to enable debug print
// process.env.DEBUG = '*';

var crawler = require("../ucsdAcademicHistory/src/index");

crawler.authenticateUser(
    "username",
    "password",
    console.log,
    () => { console.log("Valid UCSD Student Credential!"); }
);

// console.log logs reason string for failure
// If credential is correct, "Valid UCSD Student Credential!" is printed

```

### Get Academic History of the Student

```js

// Uncomment below the line to enable debug print
// or run `DEBUG=* node index` to enable debug print
// process.env.DEBUG = '*';

var crawler = require("../ucsdAcademicHistory/src/index");

crawler.getAcademicHistory(
    "username",
    "password",
    console.log,
    (report) => { console.log(JSON.stringify(report, null, 2)); },
    false     // set to true, if you want the raw web page html
);

```

Result of Academic History JSON has following fields

```

{
  "generalInfo": {
    "name": "Doe, John",                
    "pid": "A01234567",                 
    "level": "UN",                     
    "college": "Revelle College",       
    "major": "Computer Science",        
    "degree": "Bachelor of Science"
  },
  "gradeOptions": {
    "letter": {
      "attendCredit": "94.00",
      "passedCredit": "94.00",
      "gpaCredit": "94.00",
      "sumGPA": "354.60",
      "avgGPA": "3.772"
    },
    "pnp": {
      "attendCredit": "3.00",
      "passedCredit": "49.00",
      "gpaCredit": "0.00",
      "sumGPA": "0.00",
      "avgGPA": "0.000"
    },
    "all": {
      "attendCredit": "97.00",
      "passedCredit": "143.00",
      "gpaCredit": "94.00",
      "sumGPA": "354.60",
      "avgGPA": "3.772"
    }
  },
  "transferCredits": [
    {
      "subject": "AP",
      "course": "CH5",
      "title": "Chemistry Advanced Placement Credit",
      "unit": "8.00",
      "grade": "P",
      "term": "SP14",
      "level": "LD",
      "ucsdEquiv": [
        "CHEM 6A",
        "CHEM 6B",
        "CHEM 6C"
      ]
    }
    // ......
  ],
  "ucsdCredits": {
    "SpringQtr2017": [            // Quarter Name + "Qtr" + year
      {
        "subject": "CSE",
        "course": "101",
        "title": "Design & Analysis of Algorithm",
        "units": "4.00",
        "grade": "",              // Empty for unresolved, or letter grade string
        "pointsRepeat": "0.00"
      },
      // ......
    ]
    // .....
  }
}

```

## Installation

`npm install ucsd-sso-crawler`

Have npm module `phantomjs-prebuilt` installed in path
or have the `phantomjs` command available globally

## API

### authenticateUser(username, password, onErr, onSuccess)

Verify if the username/password pair can login to UCSD Student SSO.

| Arguments          | Description              |
| ------------------ |:------------------------ |
| **username**       | username                 |
| **password**       | password                 |
| **onSuccess**      | callback exec when credentials are valid, takes no arguments |
| **onErr**          | callback exec when error occurs, takes err reason as string  |

### getAcademicHistory(username, password, onErr, onSuccess, [raw])

Get the students academic history as JSON, or HTML string in JSON, if credentials are valid

| Arguments          | Description              |
| ------------------ |:------------------------ |
| **username**       | username                 |
| **password**       | password                 |
| **onSuccess**      | callback exec when credentials are valid, takes JSONas argument  |
| **onErr**          | callback exec when error occurs, takes err reason as string  |
| **raw**            | true, if you want raw html content(contains extra info ex: grade distribution of the classes taken) in JSON |

### getAcademicHistory(username, password, onErr, onSuccess, [raw])

Get the students academic history and degree audit HTML string as JSON, or 2 HTML string in JSON, if credentials are valid

| Arguments          | Description              |
| ------------------ |:------------------------ |
| **username**       | username                 |
| **password**       | password                 |
| **onSuccess**      | callback exec when credentials are valid, takes JSON as argument  |
| **onErr**          | callback exec when error occurs, takes err reason as string  |
| **raw**            | true, if you want academic history raw html content |

## Issues

Even querying 2 users academic history at the same time increases the failure rate by a lot.

I guess concurrency went wrong somewhere, or phantomjs costs too much cpu power.

I'd better add a queue inside, or you may wrap a queue outside for now.

## License
Copyright (c) Chenxu Jiang <chj028@ucsd.edu>

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
