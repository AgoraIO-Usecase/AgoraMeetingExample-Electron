import React, { useEffect, useMemo, useState } from 'react';
import { ListItem, Stack, Slide, IconButton } from '@mui/material';
import NavigateBeforeOutlinedIcon from '@mui/icons-material/NavigateBeforeOutlined';
import NavigateNextOutlinedIcon from '@mui/icons-material/NavigateNextOutlined';
import { FixedSizeList, ListChildComponentProps } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';

import AttendeeItem from '../attendee';
import { useStore, StoreState, useCommonManager } from '../../../../hooks';
import useStyle from './style';
import { generateVideoboxId } from '../utils';

const renderRow = (
  props: ListChildComponentProps<{
    state: StoreState;
    onItemClicked: (index: number) => void;
  }>
) => {
  const { index, style, data } = props;
  const { state, onItemClicked } = data;

  return (
    <ListItem
      style={style}
      key={index}
      component="div"
      disablePadding
      onClick={() => onItemClicked(index)}
    >
      <AttendeeItem attendee={state.attendees[index]} />
    </ListItem>
  );
};

const AttendeeView = () => {
  const style = useStyle();
  const { state } = useStore();
  const commonManager = useCommonManager();
  const [mainViewIndex, setMainViewIndex] = useState(0);
  const needShowAttendeeList = useMemo(() => {
    return state.attendees.length > 1;
  }, [state]);
  const [showAttendeeList, setShowAttendeeList] =
    useState(needShowAttendeeList);

  useEffect(() => {
    setShowAttendeeList(needShowAttendeeList);
  }, [needShowAttendeeList]);

  useEffect(() => {
    if (mainViewIndex >= state.attendees.length)
      setMainViewIndex(state.attendees.length - 1);
  }, [state]);

  const onItemClicked = (index: number) => {
    if (mainViewIndex === index) return;

    const oldAttendee = state.attendees[mainViewIndex];
    const dom = document.getElementById(
      generateVideoboxId(oldAttendee.uid, true)
    );
    if (dom) {
      if (oldAttendee.isSelf) commonManager.destroyLocalVideoRenderer(dom);
      else commonManager.destroyRemoteVideoRenderer(oldAttendee.uid, dom);
    }

    setMainViewIndex(index);
  };

  const onSlideButtonClicked = () => {
    setShowAttendeeList(!showAttendeeList);
  };

  return (
    <Stack direction="row" className={style.wrapper}>
      <Stack className={style.videoBoxMainContainer}>
        {mainViewIndex < state.attendees.length ? (
          <AttendeeItem
            isMain
            isFit
            attendee={state.attendees[mainViewIndex]}
          />
        ) : (
          <></>
        )}
        <Stack
          className={style.videoBoxListSwitchContainer}
          alignItems="center"
          justifyContent="center"
        >
          {needShowAttendeeList ? (
            <IconButton onClick={onSlideButtonClicked}>
              {showAttendeeList ? (
                <NavigateBeforeOutlinedIcon color="primary" fontSize="large" />
              ) : (
                <NavigateNextOutlinedIcon color="primary" fontSize="large" />
              )}
            </IconButton>
          ) : (
            <></>
          )}
        </Stack>
      </Stack>
      <Slide direction="left" in={showAttendeeList} mountOnEnter unmountOnExit>
        <Stack className={style.videoBoxListContainer}>
          <AutoSizer>
            {({ height, width }) => (
              <FixedSizeList
                height={height}
                itemCount={state.attendees.length}
                itemSize={160}
                width={width}
                itemData={{ state, onItemClicked }}
              >
                {renderRow}
              </FixedSizeList>
            )}
          </AutoSizer>
        </Stack>
      </Slide>
    </Stack>
  );
};

export default AttendeeView;
