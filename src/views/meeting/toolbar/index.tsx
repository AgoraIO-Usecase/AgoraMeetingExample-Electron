import React from 'react';
import Draggable from 'react-draggable';

import Toolbar from './toolbar';
import useStyle from './style';

const DraggableToolbar = () => {
  const style = useStyle();
  return (
    <Draggable handle="#draggable-toolbar" bounds="#root">
      <div id="draggable-toolbar" className={style.draggableContainer}>
        <Toolbar />
      </div>
    </Draggable>
  );
};

export { DraggableToolbar };

export default Toolbar;
