import {
  takeEvery,
  call,
  put,
  all,
  select,
} from 'redux-saga/effects';
import I from 'immutable';

import {
  DELETE_POLL_FAIL,
  DELETE_POLL_REQUEST,
  DELETE_POLL_SUCCESS,
  GET_MY_POLLS,
  TAKE_USER_POLLS_FAIL,
  TAKE_USER_POLLS_REQUEST,
  TAKE_USER_POLLS_SUCCESS,
} from '../constants/actionTypes';
import {
  deleteForm,
  getFormSubmissions,
  getQuestionsOfForm,
  getUserForms,
} from '../lib/api/unsplashService';
import { getAPIKey } from '../selectors';

function* takeUserPolls() {
  try {
    // Get API Key
    const API_KEY = yield select(getAPIKey);

    // Get user's forms
    const { status, data: { content } } = yield call(getUserForms, API_KEY);

    if (status !== 200) {
      throw Error('Request failed for forms');
    }
    // Extract polls from forms
    const polls = [];
    content.map(form => (form.title.substring(0, 10) === '__JFPoll__' && form.status !== 'DELETED' ? polls.push(form) : null));
    // Get questions for each form
    const newPolls = [];

    // const x = yield all(polls.map(({ id }) => {
    //   return [
    //     call(getQuestionsOfForm, API_KEY, id),
    //     call(getFormSubmissions, API_KEY, id),
    //   ];
    // }).flat());

    // console.log(x);

    for (let i = 0; i < polls.length; i += 1) {
      const {
        id,
        // eslint-disable-next-line camelcase
        created_at,
        title,
        count,
      } = polls[i];
      const pollName = title.substring(11, title.length - 1);

      // Get questions & submissions
      const [
        questionsResponse,
        submissions,
      ] = yield all([
        call(getQuestionsOfForm, API_KEY, id),
        call(getFormSubmissions, API_KEY, id),
      ]);

      const { data } = questionsResponse;
      const res = submissions;

      // Update votes with submissons
      const options = data.content['3'].options.split('|').map(option => {
        let votes = 0;
        // eslint-disable-next-line no-return-assign
        res.data.content.map(submisson => (submisson.answers['3'].answer === option ? votes += 1 : null));
        return ({ optionText: option, votes });
      });

      // Create new poll object from form
      const newPoll = I.fromJS({
        id,
        pollName,
        date: created_at.substring(0, 11),
        votes: count,
        status: 'finished', // TODO: Update status
        question: {
          questionText: data.content['3'].text,
          options,
        },
      });
      newPolls.push(newPoll);
    }

    yield put({
      type: TAKE_USER_POLLS_SUCCESS,
      payload: newPolls,
    });
  } catch (error) {
    yield put({
      type: TAKE_USER_POLLS_FAIL,
      payload: error.message,
    });
  }
}

function* pollRequest(action) {
  yield put({
    type: TAKE_USER_POLLS_REQUEST,
    payload: action.payload,
  });
}

function* deletePollReq({ payload }) {
  try {
    const key = window.JF.getAPIKey();
    yield call(deleteForm, key, payload);
    yield put({ type: DELETE_POLL_SUCCESS, payload });
  } catch (error) {
    yield put({ type: DELETE_POLL_FAIL, payload });
  }
}

const myPollsSagas = [
  takeEvery(GET_MY_POLLS, pollRequest),
  takeEvery(TAKE_USER_POLLS_REQUEST, takeUserPolls),
  takeEvery(DELETE_POLL_REQUEST, deletePollReq),
];

export default myPollsSagas;
