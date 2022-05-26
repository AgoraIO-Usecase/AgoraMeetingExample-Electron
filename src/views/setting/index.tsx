/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';
import {
  Dialog,
  DialogTitle,
  Tabs,
  Tab,
  Typography,
  Box,
  Stack,
  Paper,
  PaperProps,
  IconButton,
} from '@mui/material';
import Draggable from 'react-draggable';
import CloseIcon from '@mui/icons-material/Close';
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined';
import VideocamOutlinedIcon from '@mui/icons-material/VideocamOutlined';
import GraphicEqOutlinedIcon from '@mui/icons-material/GraphicEqOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

import CommonPage from './pages/common';
import VideoPage from './pages/video';
import AudioPage from './pages/audio';
import AboutPage from './pages/about';

const tabs: {
  index: number;
  label: string;
  icon: string | React.ReactElement;
  panel: React.ReactNode;
}[] = [
  {
    index: 0,
    label: 'Common',
    icon: <InsertDriveFileOutlinedIcon />,
    panel: <CommonPage />,
  },
  {
    index: 1,
    label: 'Video',
    icon: <VideocamOutlinedIcon />,
    panel: <VideoPage />,
  },
  {
    index: 2,
    label: 'Audio',
    icon: <GraphicEqOutlinedIcon />,
    panel: <AudioPage />,
  },
  {
    index: 3,
    label: 'About',
    icon: <InfoOutlinedIcon />,
    panel: <AboutPage />,
  },
];

const SettingTabPanel = (props: {
  children?: React.ReactNode;
  title: string;
  index: number;
  value: number;
}) => {
  const { children, title, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`vertical-tabpanel-${index}`}
      aria-labelledby={`vertical-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Stack sx={{ p: 3 }} direction="column">
          <Typography variant="h6" gutterBottom component="div">
            {title}
          </Typography>
          {children}
        </Stack>
      )}
    </div>
  );
};

const SettingTabs = () => {
  const [value, setValue] = React.useState(0);

  const a11yProps = (index: number) => {
    return {
      id: `vertical-tab-${index}`,
      'aria-controls': `vertical-tabpanel-${index}`,
    };
  };

  const handleChange = (_event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <Box
      sx={{
        flexGrow: 1,
        bgcolor: 'background.paper',
        display: 'flex',
        width: 600,
        height: 480,
      }}
    >
      <Tabs
        orientation="vertical"
        variant="scrollable"
        value={value}
        onChange={handleChange}
        aria-label="Vertical tabs example"
        sx={{ borderRight: 1, borderColor: 'divider' }}
        visibleScrollbar={false}
        style={{ paddingTop: '24px', width: '140px', minWidth: '140px' }}
      >
        {tabs.map((tab) => (
          <Tab
            key={tab.index}
            icon={tab.icon}
            iconPosition="start"
            label={tab.label}
            {...a11yProps(0)}
          />
        ))}
      </Tabs>
      {tabs.map((tab) => (
        <SettingTabPanel
          key={tab.index}
          value={value}
          index={tab.index}
          title={tab.label}
        >
          {tab.panel}
        </SettingTabPanel>
      ))}
    </Box>
  );
};

const SettingTitle = (props: {
  id: string;
  children?: React.ReactNode;
  onClose: () => void;
  style?: React.CSSProperties;
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

const SettingPaperComponent = (props: PaperProps) => {
  return (
    <Draggable
      handle="#draggable-dialog-title"
      cancel={'[class*="MuiDialogContent-root"]'}
    >
      <Paper {...props} />
    </Draggable>
  );
};

const SettingView = (props: { open: boolean; onClose: () => void }) => {
  const { open, onClose } = props;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperComponent={SettingPaperComponent}
      aria-labelledby="draggable-dialog-title"
    >
      {/* <SettingTitle
        id="draggable-dialog-title"
        style={{ cursor: 'move' }}
        onClose={onClose}
      >
        Setting
      </SettingTitle> */}
      <SettingTabs />
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
    </Dialog>
  );
};

export default SettingView;