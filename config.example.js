// ========= EXAMPLE CONFIG =========
// NOTE: This is an example config! You will need to plug in values for your
// own items for some of the config options (if config value is named starting
// with `example-`, it needs to be replaced)! You also will need to rename this
// file from `config.example.js` to `config.js` or create a new file that
// is named config.js and contains the same config values and structure for
// the script to run and not give errors due to misconfiguration. Check out
// the GitHub page for more config info. Thank you for reading this note!

// this is the config container ref — it is required for the script to run
const config = {
  sheetId: 'example-id', // the id of the sheet to read data from
  formId: 'example-id', // the id of the form to update/modify
  numRowsToGet: 500, // the number of rows to initally query for data
  topicSheet: 'Series', // the sheet where the topics are stored
  requestSheet: 'Requests', // the sheet where the requests are stored
  startRow: 3, // the row where data to retrieve starts
  topicColumn: 2, // the column where the topic is in the topic sheet
  topicStatusColumn: 8, // the column where the status of accepting requests is for a topic
  requestColumn: 2, // the column where the request topic is in the requests sheet
  requestSeriesColumn: 3, // the column where the corresponding series is for a request
};
