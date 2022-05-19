import React from 'react';
import { useNavigate } from 'react-router-dom';

const MainView = () => {
  const navigate = useNavigate();
  return (
    <div>
      <p>MainView</p>
      <button
        type="button"
        onClick={() => {
          navigate('/meeting');
        }}
      >
        Go Meeting
      </button>
    </div>
  );
};

export default MainView;
