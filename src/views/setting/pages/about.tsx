import React, { useMemo } from 'react';
import { remote } from 'electron';
import { Stack, Typography, Button } from '@mui/material';
import { useCommonManager } from '../../../hooks';
import { exploreToFile } from '../../../utils/resource';

const AboutPage = () => {
  const commonManager = useCommonManager();
  const version = useMemo(() => commonManager.getVersion(), []);

  const onOpenLogFolder = () => {
    exploreToFile(remote.app.getPath('logs'));
  };

  return (
    <Stack spacing={2}>
      <Stack spacing={1}>
        <Typography variant="h6" gutterBottom display="block">
          Log
        </Typography>
        <Button
          variant="outlined"
          style={{ width: '180px' }}
          onClick={onOpenLogFolder}
        >
          Open Folder
        </Button>
      </Stack>
      <Stack spacing={1}>
        <Typography variant="h6" gutterBottom display="block">
          Version
        </Typography>
        <Typography variant="body2" gutterBottom display="block">
          {`SDK: ${version.rtcVersion}`}
        </Typography>
      </Stack>
    </Stack>
  );
};

export default AboutPage;
