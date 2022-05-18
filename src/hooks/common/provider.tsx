import React, { FC, useEffect, useState } from 'react';
import { CommonManagerContext } from './context';
import { CommonManager } from './types';

// eslint-disable-next-line import/prefer-default-export
export const CommonManagerProvider: FC = (props) => {
  const [manager, setManager] = useState<CommonManager>();
  const { children } = props;

  useEffect(() => {
    if (!manager) {
      const commonManager = new CommonManager();

      console.info('initialize attendee manager', commonManager);

      setManager(commonManager);
    }
  }, []);

  return (
    <CommonManagerContext.Provider value={{ commonManager: manager }}>
      {children}
    </CommonManagerContext.Provider>
  );
};
