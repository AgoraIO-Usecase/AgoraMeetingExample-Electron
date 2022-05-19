import React from 'react';
import { useNavigate } from 'react-router-dom';

const MeetingView = () => {
  const navigate = useNavigate();
  return (
    <div>
      <p>MeetingView</p>
      <button
        type="button"
        onClick={() => {
          navigate('/main');
        }}
      >
        Go Main
      </button>
    </div>
  );
};

export default MeetingView;
