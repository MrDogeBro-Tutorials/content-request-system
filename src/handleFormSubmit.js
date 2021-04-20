const pushFormData = () => {
  let sheet = SpreadsheetApp.openById(config.responseSheetId);

  let series = [];
  sheet
    .getSheetByName(config.responseSheet)
    .getSheetValues(2, config.responseSeriesColumn, config.numRowsToGet, 1)
    .forEach((cell) => (cell[0].length > 0 ? series.push(cell[0]) : null));

  let topics = sheet
    .getSheetByName(config.responseSheet)
    .getSheetValues(2, config.responseTopicColumn, series.length, 1)
    .map((cell) => cell[0]);

  let descriptions = sheet
    .getSheetByName(config.responseSheet)
    .getSheetValues(2, config.responseDescriptionColumn, series.length, 1)
    .map((cell) => cell[0]);
};
