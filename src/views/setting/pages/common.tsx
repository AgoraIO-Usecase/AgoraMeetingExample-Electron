import React from 'react';
import { Stack, Checkbox, FormControlLabel } from '@mui/material';

import { useCommonManager } from '../../../hooks';

const CommonPage = () => {
  const commonManager = useCommonManager();

  return (
    <Stack spacing={2} width="320px">
      <FormControlLabel
        control={
          <Checkbox
            defaultChecked={commonManager.isVoiceActivatedEnabled()}
            onChange={(_evt, checked: boolean) => {
              commonManager.enableVoiceActivated(checked);
            }}
            name="microphone"
          />
        }
        label="Voice Activated"
      />
    </Stack>
  );
};

export default CommonPage;
