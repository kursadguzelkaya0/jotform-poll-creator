import { func, instanceOf } from 'prop-types';
import React from 'react';
import I from 'immutable';
import ReactDom from 'react-dom';

import '../styles/DetailsModal.css';
import QuestionResult from './QuestionResult';
import { ReactComponent as CancelIcon } from '../assets/icons/times-circle-solid.svg';

const DetailsModal = ({ poll, setShowModal }) => {
  return ReactDom.createPortal(
    <>
      <div className="overlay">{}</div>
      <div className="modal">
        <h1>{poll.get('pollName')}</h1>
        <div className="poll-questions">
          <QuestionResult className="question-result" question={poll.get('question')} totalVotes={poll.get('votes')} />
        </div>
        <div className="btn-container">
          <button id="close-modal" type="button" className="btn" onClick={() => setShowModal(false)}>
            <CancelIcon className="icon" />
            Close
          </button>
        </div>
      </div>
    </>,
    document.getElementById('portal'),
  );
};

DetailsModal.propTypes = {
  poll: instanceOf(I.Map).isRequired,
  setShowModal: func,
};

DetailsModal.defaultProps = {
  setShowModal: f => f,
};

export default DetailsModal;
