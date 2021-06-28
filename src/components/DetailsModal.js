import { func, instanceOf } from 'prop-types';
import React from 'react';
import I from 'immutable';
import ReactDom from 'react-dom';

import '../styles/DetailsModal.css';
import QuestionResult from './QuestionResult';

const DetailsModal = ({ poll, setShowModal }) => {
  console.log('Result');
  return ReactDom.createPortal(
    <>
      <div className="overlay">{}</div>
      <div className="modal">
        <h1>{poll.get('pollName')}</h1>
        <div className="poll-questions">
          <QuestionResult question={poll.get('question')} totalVotes={poll.get('votes')} />
        </div>
        <div className="btn-container">
          <button id="close-modal" type="button" className="btn" onClick={() => setShowModal(false)}>Close</button>
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