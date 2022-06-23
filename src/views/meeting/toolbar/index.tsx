import React from 'react';
import Draggable from 'react-draggable';

import Toolbar from './toolbar';

const DraggableToolbar = () => {
  return (
    <Draggable handle="#draggable-toolbar" bounds="#root">
      <div
        id="draggable-toolbar"
        style={{
          position: 'absolute',
          top: '10px',
          right: '400px',
          cursor: 'move',
          zIndex: '10000',
        }}
      >
        <Toolbar />
      </div>
    </Draggable>
  );
};

export { DraggableToolbar };

export default Toolbar;
