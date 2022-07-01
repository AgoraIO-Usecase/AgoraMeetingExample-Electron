/* eslint-disable react/jsx-props-no-spreading */
/* eslint-disable no-nested-ternary */
import React, { useEffect, useMemo, useState } from 'react';
import { ListItem, Stack, Slide, IconButton } from '@mui/material';
import NavigateBeforeOutlinedIcon from '@mui/icons-material/NavigateBeforeOutlined';
import NavigateNextOutlinedIcon from '@mui/icons-material/NavigateNextOutlined';
import { FixedSizeList, ListChildComponentProps } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';

import AttendeeItem from '../attendee';
import WhiteBoardView from '../../../components/whiteboard';
import {
  useStore,
  StoreState,
  useCommonManager,
  WhiteBoardState,
} from '../../../../hooks';
import useStyle from './style';
import { generateVideoboxId } from '../../../../utils/generate';
import { useFocusHelper } from '../../../../utils/focushelper';

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
      id={`speaker-attendee-item-${state.attendees[index].uid}`}
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

const SpeakerAttendeeView = () => {
  const style = useStyle();
  const { state } = useStore();
  const commonManager = useCommonManager();
  const [mainViewIndex, setMainViewIndex] = useState(0);
  const needShowAttendeeList = useMemo(() => {
    return state.attendees.length > 1 || state.focusMode;
  }, [state]);
  const [showAttendeeList, setShowAttendeeList] =
    useState(needShowAttendeeList);
  const focusHelper = useFocusHelper();
  const currentWhiteBoardAttendee = useMemo(() => {
    if (
      state.whiteboardState !== WhiteBoardState.Running ||
      commonManager.whiteboardIsSelfCreator()
    )
      return undefined;

    const whiteboardRoomInfo = commonManager.whiteboardGetRoomInfo();
    return state.attendees.find((attendee) => {
      return attendee.uid === whiteboardRoomInfo.parentId;
    });
  }, [state]);

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
      <Stack className={style.mainContainer}>
        {state.whiteboardState === WhiteBoardState.Running ? (
          <WhiteBoardView attendee={currentWhiteBoardAttendee} />
        ) : mainViewIndex < state.attendees.length && !state.focusMode ? (
          <AttendeeItem
            isMain
            isFit
            attendee={state.attendees[mainViewIndex]}
          />
        ) : (
          <></>
        )}
        <Stack
          className={style.sliderContainer}
          alignItems="center"
          justifyContent={state.focusMode ? 'flex-start' : 'center'}
          style={{
            right: state.focusMode && showAttendeeList ? '160px' : '0px',
          }}
        >
          {needShowAttendeeList ? (
            <IconButton
              className={style.slider}
              onClick={onSlideButtonClicked}
              {...focusHelper}
            >
              {showAttendeeList ? (
                <NavigateBeforeOutlinedIcon color="primary" fontSize="medium" />
              ) : (
                <NavigateNextOutlinedIcon color="primary" fontSize="medium" />
              )}
            </IconButton>
          ) : (
            <></>
          )}
        </Stack>
      </Stack>
      <Slide
        direction="left"
        in={showAttendeeList}
        mountOnEnter
        unmountOnExit
        style={{ position: state.focusMode ? 'absolute' : 'relative' }}
      >
        <Stack className={style.listContainer} {...focusHelper}>
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

export default SpeakerAttendeeView;
