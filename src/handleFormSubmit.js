const pushFormData = () => {
  let verifyCols = [];

  let sheet = SpreadsheetApp.openById(config.responseSheetId);

  let questionRow = sheet
    .getSheetByName(config.responseSheet)
    .getSheetValues(1, 1, 1, 100);

  for (let i = 0; i < questionRow[0].length; i++)
    if (questionRow[0][i] == 'Verify question duplicate status.')
      verifyCols.push(i + 1);
};
