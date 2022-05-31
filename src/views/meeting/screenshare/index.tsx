import React, { useEffect, useState } from 'react';
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Typography,
  Stack,
  Tooltip,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';
import { Image } from 'image-js';
import { useCommonManager } from '../../../hooks';

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
  margin: '4px 4px',
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
  id: number;
  index: number;
  isSelected?: boolean;
  icon?: Image | undefined;
  thumb?: Image | undefined;
  title?: string;
  onClick: (index: number) => void;
}) => {
  const { id, index, isSelected, icon, thumb, title, onClick } = props;
  return (
    <StyledScreenShareItem
      style={{
        borderStyle: 'solid',
        borderWidth: isSelected ? '1px' : '0px',
        borderColor: '#1976d2',
      }}
      onClick={() => onClick(index)}
    >
      {thumb ? (
        <img
          width={thumb.width}
          height={thumb.height}
          src={thumb.toDataURL('image/png')}
          alt={`${id}`}
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
          background: '#2F2B2B2B',
          zIndex: '1000',
          padding: '0px 6px',
          position: 'absolute',
          bottom: '0px',
        }}
        alignItems="flex-start"
        justifyContent="center"
      >
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
          {title}
        </Typography>
      </Stack>
    </StyledScreenShareItem>
  );
};

const ScreenShareDialog = (props: { open: boolean; onClose: () => void }) => {
  const { open, onClose } = props;
  const commonManager = useCommonManager();
  const [sources, setSources] = useState([]);
  const [currentSelected, setCurrentSelected] = useState(-1);

  useEffect(() => {
    commonManager
      .getScreenCaptureSources()
      .then((value) => {
        console.info('screenshare sources', value);
        setSources(value as never[]);
        return 0;
      })
      .catch((e) => {
        console.error('screenshare error', e);
      });
  }, []);

  const onItemClicked = (index: number) => {
    setCurrentSelected(index);
  };

  const onPreClose = () => {
    if (currentSelected >= 0) {
      const source = sources[currentSelected] as {
        type: number;
        sourceId: number;
      };
      commonManager.startScreenShare({
        windowId: source.type === 0 ? source.sourceId : undefined,
        displayId: source.type === 1 ? source.sourceId : undefined,
      });
    }

    setCurrentSelected(-1);
    onClose();
  };

  return (
    <StyledDialog aria-labelledby="customized-dialog-title" open={open}>
      <ScreenShareDialogTitle id="customized-dialog-title" onClose={onPreClose}>
        ScreenShare
      </ScreenShareDialogTitle>
      <DialogContent
        dividers
        style={{ minHeight: '360px', maxHeight: '360px', width: '560px' }}
      >
        <StyledScreenShareItemContainer>
          {sources.map((item, index) => {
            const source = item as {
              icon?: Image;
              thumb?: Image;
              sourceTitle: string;
              sourceName: string;
              sourceId: number;
            };
            const itemTitle = source.sourceTitle.length
              ? source.sourceTitle
              : source.sourceName;
            return (
              <ScreenShareDialogItem
                key={`${index}`}
                id={source.sourceId}
                index={index}
                icon={source.icon}
                thumb={source.thumb}
                title={itemTitle}
                isSelected={index === currentSelected}
                onClick={onItemClicked}
              />
            );
          })}
        </StyledScreenShareItemContainer>
      </DialogContent>
      <DialogActions>
        <Button autoFocus onClick={onPreClose}>
          Cancel
        </Button>
        <Button
          autoFocus
          onClick={onPreClose}
          disabled={currentSelected === -1}
        >
          OK
        </Button>
      </DialogActions>
    </StyledDialog>
  );
};

export default ScreenShareDialog;
