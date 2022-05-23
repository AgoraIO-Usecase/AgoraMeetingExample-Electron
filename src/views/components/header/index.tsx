import React from 'react';
import { Stack } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import AllInclusiveOutlinedIcon from '@mui/icons-material/AllInclusiveOutlined';
import GridViewOutlinedIcon from '@mui/icons-material/GridViewOutlined';

export declare type HeaderBarProps = {
  fixed: boolean;
  title?: string;
  layouts?: boolean;
  onLayoutClicked?: () => void;
};

const HeaderBar = (props: HeaderBarProps) => {
  const { fixed, title, layouts, onLayoutClicked } = props;

  return (
    <Stack
      position={fixed ? 'absolute' : 'relative'}
      width={fixed ? 'auto' : '100%'}
      height="52px"
      left="0"
      right="0"
      top="0"
      padding="6px 6px 6px 12px"
      boxSizing="border-box"
      direction="row"
      justifyContent="flex-end"
      alignItems="center"
    >
      <AllInclusiveOutlinedIcon color="primary" />
      {title ? (
        <Typography
          variant="subtitle2"
          component="div"
          margin="0px 0px 0px 12px"
          whiteSpace="nowrap"
        >
          {`Channel: ${title}`}
        </Typography>
      ) : (
        <></>
      )}
      <div style={{ width: '100%', height: '10px' }} />
      {layouts ? (
        <IconButton onClick={onLayoutClicked}>
          <GridViewOutlinedIcon color="primary" />
        </IconButton>
      ) : (
        <></>
      )}
      <IconButton onClick={() => {}}>
        <SettingsOutlinedIcon color="primary" />
      </IconButton>
    </Stack>
  );
};

export default HeaderBar;
