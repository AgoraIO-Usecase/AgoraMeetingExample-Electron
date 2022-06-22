import React, { useEffect } from 'react';
import { Stack } from '@mui/material';

import { useCommonManager } from '../../../hooks';
import useStyle from './style';

const WhiteBoardView = () => {
  const style = useStyle();
  const commonManager = useCommonManager();

  useEffect(() => {
    const dom = document.getElementById('whiteboard-view');
    commonManager.whiteboardSetView(dom! as HTMLDivElement);

    return () => commonManager.whiteboardSetView(null);
  }, []);

  return <Stack className={style.wrapper} id="whiteboard-view" />;
};

export default WhiteBoardView;
