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
  AttendeeInfo,
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

  const [oldMainAttendee, setOldMainAttendee] = useState<
    AttendeeInfo | undefined
  >(undefined);

  useEffect(() => {
    if (oldMainAttendee) {
      if (
        !state.mainAttendee ||
        oldMainAttendee.uid !== state.mainAttendee.uid
      ) {
        const dom = document.getElementById(
          generateVideoboxId(oldMainAttendee.uid, true)
        );
        if (dom) {
          if (oldMainAttendee.isSelf)
            commonManager.destroyLocalVideoRenderer(dom);
          else
            commonManager.destroyRemoteVideoRenderer(oldMainAttendee.uid, dom);
        }
      }
    }
    setOldMainAttendee(state.mainAttendee);
  }, [state.mainAttendee]);

  const onItemClicked = (index: number) => {
    if (
      state.mainAttendee?.uid === state.attendees[index].uid ||
      state.whiteboardState === WhiteBoardState.Running
    )
      return;

    commonManager.setMainAttendee(state.attendees[index]);
  };

  const onSlideButtonClicked = () => {
    setShowAttendeeList(!showAttendeeList);
  };

  return (
    <Stack direction="row" className={style.wrapper}>
      <Stack className={style.mainContainer}>
        {state.whiteboardState === WhiteBoardState.Running ? (
          <WhiteBoardView attendee={currentWhiteBoardAttendee} />
        ) : state.mainAttendee && !state.focusMode ? (
          <AttendeeItem isMain isFit attendee={state.mainAttendee} />
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
