const updateForm = () => {
  // setup vars
  let headers = [];
  let topics = [];

  // get the documents
  let form = FormApp.openById(config.formId);
  let sheet = SpreadsheetApp.openById(config.sheetId);

  // get the topics
  sheet
    .getSheetByName(config.topicSheet)
    .getSheetValues(config.startRow, config.topicColumn, config.numRowsToGet, 1)
    .forEach((cell) => (cell[0].length > 0 ? topics.push(cell[0]) : null));

  // get the series requests statuses
  let accepting_requests = sheet
    .getSheetByName(config.topicSheet)
    .getSheetValues(config.startRow, config.topicStatusColumn, topics.length, 1)
    .map((cell) => cell[0]);

  // stop script from running mid change
  if (topics.length !== accepting_requests.length) return;

  // get the form questions
  let questions = form.getItems();

  // get the different series headers
  questions.forEach((q) =>
    q.getTitle().includes('Series Request') ? headers.push(q) : null
  );

  // update questions
  questions.forEach((q) => {
    q.getTitle() === 'What series is this request for?'
      ? // update list of series available
        updateSeriesList(q, topics, accepting_requests, headers, form, sheet)
      : null;
  });

  // automatically remove old series sections
  pruneSections(form, topics, accepting_requests, headers);
};

const updateSeriesList = (
  question,
  topics,
  accepting_requests,
  headers,
  form,
  sheet
) => {
  // setup vars
  let q = question.asMultipleChoiceItem();
  let choices = [];

  // add series accepting requests to var
  accepting_requests.forEach((acc_req, i) => {
    acc_req.toLowerCase() === 'yes'
      ? choices.push(
          q.createChoice(
            topics[i],
            getGotoPage(topics[i], headers, form, sheet)
          )
        )
      : null;
  });

  // set options to accepting series
  q.setChoices(choices);
};

const pruneSections = (form, topics, accepting_requests, headers) => {
  // setup vars
  let verifyQs = [];
  let numAccepting = accepting_requests.length;

  // go through section headers
  for (let i = 0; i < headers.length; i++) {
    let topicInUse = false;

    // set topic in use if series is accepting requests
    for (let t = 0; t < topics.length; t++)
      if (
        headers[i].getTitle().endsWith(topics[t]) &&
        accepting_requests[t].toLowerCase() === 'yes'
      ) {
        topicInUse = true;
        break;
      }

    // remove section header if not in use
    if (!topicInUse) form.deleteItem(headers[i]);
  }

  // get the form questions
  let questions = form.getItems();

  // only get verify questions
  questions.forEach((q) => {
    q.getTitle() === 'Verify question duplicate status.'
      ? verifyQs.push(questions[i])
      : null;
  });

  // remove extra verify questions
  for (let i = 0; i < verifyQs.length; i++) {
    // reverse go through questions until the number of topics
    // equals the number of verify questions
    let revI = verifyQs.length - i;
    if (revI === numAccepting) return;

    // get verify question and remove choices
    let toRem = verifyQs[revI - 1];
    let toRemChoice = toRem.asMultipleChoiceItem();
    toRemChoice.setChoices[toRemChoice.createChoice('')];

    // remove verify question
    form.deleteItem(toRem);
  }
};

const getGotoPage = (topic, headers, form, sheet) => {
  // setup vars
  let requestsList = [];
  let requestPage;

  // get the topics
  let topics = sheet
    .getSheetByName(config.requestSheet)
    .getSheetValues(
      config.startRow,
      config.requestColumn,
      config.numRowsToGet,
      1
    )
    .forEach((cell) => (cell[0].length > 0 ? topics.push(cell[0]) : null));

  // get the series
  let series = sheet
    .getSheetByName(config.requestSheet)
    .getSheetValues(
      config.startRow,
      config.requestSeriesColumn,
      topics.length || 1,
      1
    )
    .map((cell) => cell[0]);

  // get requests for selected series
  series.forEach((s) => {
    series[i] === topic
      ? // add requests for series to list
        requestsList.push(topics[i])
      : null;
  });

  for (let i = 0; i < topics.length; i++)
    if (series[i] === topic)
      // get and update section for series
      for (let i = 0; i < headers.length; i++)
        if (headers[i].getTitle() === `Series Request: ${topic}`) {
          // update the section description and return it
          let h = headers[i].asPageBreakItem();

          if (requestsList.length > 0)
            h.setHelpText(
              'Below is a list of already requested videos for this series. Check if your request is already on the list. \n\n' +
                requestsList.join('\n')
            );
          else
            h.setHelpText(
              'There are currently no requested videos for this series. You can be the first to add one!'
            );

          return h;
        }

  // get the form questions
  let questions = form.getItems();

  // get the requests section
  for (let i = 0; i < questions.length; i++)
    if (questions[i].getTitle() === 'Request') {
      requestPage = questions[i].asPageBreakItem();
      break;
    }

  // create new section for series
  let section = form.addPageBreakItem();

  // set info for section
  section
    .setTitle(`Series Request: ${topic}`)
    .setGoToPage(FormApp.PageNavigationType.SUBMIT);

  if (requestsList.length > 0)
    section.setHelpText(
      'Below is a list of already requested videos for this series. Check if your request is already on the list. \n\n' +
        requestsList.join('\n')
    );
  else
    section.setHelpText(
      'There are currently no requested videos for this series. You can be the first to add one!'
    );

  // add question to section to verify request is not a duplicate
  let verifyQ = form.addMultipleChoiceItem();

  // set info for verify question
  verifyQ
    .setTitle('Verify question duplicate status.')
    .setChoices([
      verifyQ.createChoice('My question is not a duplicate.', requestPage),
      verifyQ.createChoice(
        'My question is a duplicate.',
        FormApp.PageNavigationType.RESTART
      ),
    ])
    .setRequired(true);

  return section;
};
