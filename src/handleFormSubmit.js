const pushFormData = () => {
  let verifyCols = [];
  let series = [];
  let topics = [];
  let descriptions = [];

  let sheet = SpreadsheetApp.openById(config.responseSheetId);

  let questionRow = sheet
    .getSheetByName(config.responseSheet)
    .getSheetValues(1, 1, 1, 100);

  for (let i = 0; i < questionRow[0].length; i++)
    if (questionRow[0][i] == 'Verify question duplicate status.')
      verifyCols.push(i + 1);

  let rawSeries = sheet
    .getSheetByName(config.responseSheet)
    .getSheetValues(2, config.responseSeriesColumn, config.numRowsToGet, 1);

  for (let i = 0; i < rawSeries.length; i++)
    if (rawSeries[i][0].length > 0) series.push(rawSeries[0][i]);

  let rawTopics = sheet
    .getSheetByName(config.responseSheet)
    .getSheetValues(2, config.responseTopicColumn, series.length, 1);

  for (let i = 0; i < rawTopics.length; i++) topics.push(rawTopics[i][0]);

  let rawDescriptions = sheet
    .getSheetByName(config.responseSheet)
    .getSheetValues(2, config.responseDescriptionColumn, series.length, 1);

  for (let i = 0; i < rawDescriptions.length; i++)
    descriptions.push(rawTopics[i][0]);
};
