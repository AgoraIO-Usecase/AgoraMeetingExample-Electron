import React from 'react';
import { ListItem, Stack } from '@mui/material';
import { FixedSizeList, ListChildComponentProps } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';

import AttendeeItem from './attendee';
import { useStore, StoreState } from '../../../hooks';
import useStyle from './style';

const renderRow = (props: ListChildComponentProps<StoreState>) => {
  const { index, style, data } = props;
  return (
    <ListItem style={style} key={index} component="div" disablePadding>
      <AttendeeItem isMain={false} attendee={data.attendees[index]} />
    </ListItem>
  );
};

const AttendeeView = () => {
  const style = useStyle();
  const { state } = useStore();

  return (
    <Stack direction="row" className={style.wrapper}>
      <Stack className={style.videoBoxMainContainer} />
      <Stack className={style.videoBoxListContainer}>
        <AutoSizer>
          {({ height, width }) => (
            <FixedSizeList
              height={height}
              itemCount={state.attendees?.length}
              itemSize={160}
              width={width}
              itemData={state}
            >
              {renderRow}
            </FixedSizeList>
          )}
        </AutoSizer>
      </Stack>
    </Stack>
  );
};

export default AttendeeView;
