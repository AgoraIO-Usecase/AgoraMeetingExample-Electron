import React, { useMemo } from 'react';
import { Typography } from '@mui/material';
import { useCommonManager } from '../../../hooks';

const AboutPage = () => {
  const commonManager = useCommonManager();
  const version = useMemo(() => commonManager.getVersion(), []);
  return (
    <Typography variant="body2" gutterBottom display="block">
      {`RTC: ${version.rtcVersion}`}
    </Typography>
  );
};

export default AboutPage;
