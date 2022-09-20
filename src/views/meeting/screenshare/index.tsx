/* eslint-disable react/jsx-props-no-spreading */
import React, { useEffect, useMemo, useState } from 'react';
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Typography,
  Stack,
  Skeleton,
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';
// import AgoraPlugin from 'agora-plugin';
import { useSnackbar } from 'notistack';
import {
  ScreenShareSource,
  StoreActionType,
  useCommonManager,
  useStore,
} from '../../../hooks';
import { useFocusHelper } from '../../../utils/focushelper';

const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialogContent-root': {
    padding: theme.spacing(2),
  },
  '& .MuiDialogActions-root': {
    padding: theme.spacing(1),
  },
}));

const StyledScreenShareItemContainer = styled(Stack)(({ theme }) => ({
  width: '100%',
  height: '100%',
  display: 'flex',
  flexDirection: 'row',
  flexWrap: 'wrap',
}));

const StyledScreenShareItem = styled(Stack)(({ theme }) => ({
  width: '176px',
  height: '160px',
  background: '#F2F2F2',
  margin: '3px 3px',
  cursor: 'pointer',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  transition: 'box-shadow 300ms cubic-bezier(0.4, 0, 0.2, 1) 0ms',
  boxShadow:
    'rgb(0 0 0 / 20%) 0px 2px 1px -1px, rgb(0 0 0 / 14%) 0px 1px 1px 0px, rgb(0 0 0 / 12%) 0px 1px 3px 0px',
  position: 'relative',
}));

const ScreenShareDialogTitle = (props: {
  id: string;
  children?: React.ReactNode;
  onClose: () => void;
}) => {
  const { children, onClose, ...other } = props;

  return (
    <DialogTitle sx={{ m: 0, p: 2 }} {...other}>
      {children}
      {onClose ? (
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
      ) : null}
    </DialogTitle>
  );
};

const ScreenShareDialogItem = (props: {
  index: number;
  isSelected?: boolean;
  onClick: (index: number) => void;
  source: ScreenShareSource;
}) => {
  const { index, isSelected, onClick, source } = props;
  return (
    <StyledScreenShareItem
      style={{
        borderStyle: 'solid',
        borderWidth: isSelected ? '1px' : '1px',
        borderColor: isSelected ? '#1976d2FF' : '#1976D200',
      }}
      onClick={() => onClick(index)}
    >
      {source.thumb ? (
        <img
          width={source.thumbWidth}
          height={source.thumbHeight}
          src={source.thumb}
          alt={`screenshare-thumb-${source.id}`}
          style={{
            maxWidth: '100%',
            maxHeight: '160px',
            height: 'auto',
            boxSizing: 'border-box',
          }}
        />
      ) : (
        <></>
      )}
      <Stack
        style={{
          boxSizing: 'border-box',
          width: '100%',
          height: '32px',
          background: '#CECBCB',
          zIndex: '1000',
          padding: '0px 6px',
          position: 'absolute',
          bottom: '0px',
        }}
        direction="row"
        alignItems="center"
        justifyContent="flex-start"
        spacing={1}
      >
        {/* {source.icon ? (
          <img
            width={source.iconWidth}
            height={source.iconHeight}
            src={source.icon}
            alt={`screenshare-icon-${source.id}`}
            style={{
              width: `${source.iconWidth}px`,
              height: `${source.iconHeight}px`,
            }}
          />
        ) : (
          <></>
        )} */}
        <Typography
          style={{
            width: '100%',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            boxSizing: 'border-box',
            userSelect: 'none',
          }}
          variant="subtitle2"
          display="block"
        >
          {source.title}
        </Typography>
      </Stack>
    </StyledScreenShareItem>
  );
};

const ScreenShareDialog = () => {
  const { state, dispatch } = useStore();
  const { enqueueSnackbar } = useSnackbar();
  const commonManager = useCommonManager();
  const [sources, setSources] = useState<ScreenShareSource[]>([]);
  const [currentSelected, setCurrentSelected] = useState(-1);
  const focusHelper = useFocusHelper();
  const [focusMode, setFocusMode] = useState(true);
  const showFocusMode = useMemo(() => {
    if (
      currentSelected === -1 ||
      sources.length === 0 ||
      !sources[currentSelected].isDisplay
    )
      return false;

    // known issue here, can not find specified display by id in windows
    if (
      process.platform === 'win32' &&
      sources[currentSelected].isDisplay &&
      !sources[currentSelected].isPrimaryDisplay
    )
      return false;

    return true;
  }, [currentSelected, sources]);

  useEffect(() => {
    if (state.showScreenShare)
      setTimeout(() => {
        commonManager
          .getScreenCaptureSources()
          .then((value) => {
            console.info('screenshare sources', value);
            setSources(value);
            return 0;
          })
          .catch((e) => {
            console.error('screenshare error', e);
          });
      }, 200);
  }, [state.showScreenShare]);

  const onItemClicked = (index: number) => {
    setCurrentSelected(index);
  };

  const onPreClose = () => {
    setSources([]);
    setCurrentSelected(-1);

    dispatch({
      type: StoreActionType.ACTION_TYPE_SHOW_SCREENSHARE,
      payload: false,
    });

    setFocusMode(true);
  };

  const onPreOk = () => {
    if (currentSelected < 0) return;
    const source = sources[currentSelected];
    // if (focusMode && !source.isDisplay && !AgoraPlugin.checkAccessPrivilege()) {
    //   enqueueSnackbar(
    //     'Please allow AgoraMeetingExample to control your mac before start screenshare with focus mode',
    //     { variant: 'error' }
    //   );
    //   return;
    // }

    commonManager.startScreenShare({
      windowId: source.isDisplay ? undefined : source.id,
      displayId: source.isDisplay ? source.id : undefined,
      focusMode: focusMode && showFocusMode,
    });

    onPreClose();
  };

  return (
    <StyledDialog
      aria-labelledby="customized-dialog-title"
      open={state.showScreenShare}
      {...focusHelper}
    >
      <ScreenShareDialogTitle id="customized-dialog-title" onClose={onPreClose}>
        ScreenShare
      </ScreenShareDialogTitle>
      <DialogContent
        dividers
        style={{ minHeight: '360px', maxHeight: '360px', width: '560px' }}
      >
        <StyledScreenShareItemContainer>
          {sources.map((item, index) => {
            return (
              <ScreenShareDialogItem
                key={`${index}`}
                index={index}
                source={item}
                isSelected={index === currentSelected}
                onClick={onItemClicked}
              />
            );
          })}
          {sources.length ? (
            <></>
          ) : (
            <Skeleton
              sx={{ height: '360px', width: '100%' }}
              animation="wave"
              variant="rectangular"
            />
          )}
        </StyledScreenShareItemContainer>
      </DialogContent>
      <DialogActions>
        {showFocusMode ? (
          <FormControlLabel
            control={
              <Checkbox
                checked={focusMode}
                onChange={(_evt, checked: boolean) => {
                  setFocusMode(checked);
                }}
                name="Focus Mode"
              />
            }
            label="Focus Mode"
          />
        ) : (
          <></>
        )}
        <Button autoFocus onClick={onPreClose}>
          Cancel
        </Button>
        <Button autoFocus onClick={onPreOk} disabled={currentSelected === -1}>
          OK
        </Button>
      </DialogActions>
    </StyledDialog>
  );
};

export default ScreenShareDialog;
