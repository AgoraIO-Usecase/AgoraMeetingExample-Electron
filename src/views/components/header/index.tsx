import React, { useCallback, useState, useMemo } from 'react';
import { Stack, Tooltip } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import AllInclusiveOutlinedIcon from '@mui/icons-material/AllInclusiveOutlined';
import GridViewOutlinedIcon from '@mui/icons-material/GridViewOutlined';

import LayoutMenu from './layout';
import SettingView from '../../setting';

export declare type HeaderBarProps = {
  fixed: boolean;
  title?: string;
  layouts?: boolean;
};

const HeaderBar = (props: HeaderBarProps) => {
  const { fixed, title, layouts } = props;
  const [showSetting, setShowSetting] = useState(false);
  const [layoutMenuAnchor, setLayoutMenuAnchor] = useState<Element | null>(
    null
  );
  const showLayoutMenu = useMemo(
    () => Boolean(layoutMenuAnchor),
    [layoutMenuAnchor]
  );

  const onSettingClicked = useCallback(() => {
    setShowSetting(true);
  }, []);

  const onLayoutClicked = useCallback(
    (evt: React.MouseEvent<HTMLButtonElement>) => {
      setLayoutMenuAnchor(evt.currentTarget);
    },
    []
  );

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
          style={{ userSelect: 'none' }}
        >
          {`Channel: ${title}`}
        </Typography>
      ) : (
        <></>
      )}
      <div style={{ width: '100%', height: '10px' }} />
      {layouts ? (
        <>
          <Tooltip arrow title="AttendeeView Layout">
            <IconButton
              id="layout-button"
              aria-controls={showLayoutMenu ? 'layout-menu' : undefined}
              aria-haspopup="true"
              aria-expanded={showLayoutMenu ? 'true' : undefined}
              onClick={onLayoutClicked}
            >
              <GridViewOutlinedIcon color="primary" />
            </IconButton>
          </Tooltip>
          <LayoutMenu
            id="layout-menu"
            anchor={layoutMenuAnchor}
            anchorId="layout-button"
            open={showLayoutMenu}
            onClose={() => setLayoutMenuAnchor(null)}
          />
        </>
      ) : (
        <></>
      )}
      <Tooltip arrow title="Setting">
        <IconButton onClick={onSettingClicked}>
          <SettingsOutlinedIcon color="primary" />
        </IconButton>
      </Tooltip>
      <SettingView
        open={showSetting}
        onClose={() => {
          setShowSetting(false);
        }}
      />
    </Stack>
  );
};

export default HeaderBar;
