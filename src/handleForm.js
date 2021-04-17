const updateForm = () => {
  // setup vars
  let topics = [];
  let accepting_requests = [];
  let headers = [];

  // get the documents
  let form = FormApp.openById(config.formId);
  let sheet = SpreadsheetApp.openById(config.sheetId);

  // get the topics
  let rawTopics = sheet
    .getSheetByName(config.topicSheet)
    .getSheetValues(3, 2, config.numRowsToGet, 1);

  // add valid topics to var
  for (let i = 0; i < rawTopics.length; i++)
    if (rawTopics[i][0].length > 0) topics.push(rawTopics[i][0]);

  // get the series requests statuses
  let rawRequests = sheet
    .getSheetByName(config.topicSheet)
    .getSheetValues(3, 8, topics.length, 1);

  // add valid request status to var
  for (let i = 0; i < rawRequests.length; i++)
    accepting_requests.push(rawRequests[i][0]);

  // stop script from running mid change
  if (topics.length !== accepting_requests.length) return;

  // get the form questions
  let questions = form.getItems();

  for (let i = 0; i < questions.length; i++)
    if (questions[i].getTitle().includes('Series Request'))
      headers.push(questions[i]);

  // update questions
  for (let i = 0; i < questions.length; i++)
    if (questions[i].getTitle() === 'What series is this request for?')
      // update list of series available
      updateSeriesList(
        questions[i],
        topics,
        accepting_requests,
        headers,
        form,
        sheet
      );

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
  for (let i = 0; i < topics.length; i++)
    if (accepting_requests[i].toLowerCase() === 'yes')
      choices.push(
        q.createChoice(topics[i], getGotoPage(topics[i], headers, form, sheet))
      );

  // set options to accepting series
  q.setChoices(choices);
};

const pruneSections = (form, topics, accepting_requests, headers) => {
  // setup vars
  let verifyQs = [];
  let numAccepting = 0;

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
  for (let i = 0; i < questions.length; i++)
    if (questions[i].getTitle() === 'Verify question duplicate status.')
      verifyQs.push(questions[i]);

  for (let i = 0; i < topics.length; i++)
    if (accepting_requests[i].toLowerCase() === 'yes') numAccepting += 1;

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
  let topics = [];
  let series = [];
  let requestsList = [];
  let requestPage;

  // get the topics
  let rawTopics = sheet
    .getSheetByName(config.requestSheet)
    .getSheetValues(3, 2, config.numRowsToGet, 1);

  // add valid topics to var
  for (let i = 0; i < rawTopics.length; i++)
    if (rawTopics[i][0].length > 0) topics.push(rawTopics[i][0]);

  // get the series
  let rawSeries = sheet
    .getSheetByName(config.requestSheet)
    .getSheetValues(3, 3, topics.length, 1);

  // add valid series to var
  for (let i = 0; i < rawSeries.length; i++) series.push(rawSeries[i][0]);

  // get requests for selected series
  for (let i = 0; i < topics.length; i++)
    if (series[i] === topic)
      // add requests for series to list
      requestsList.push(topics[i]);

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
