/* eslint-disable react/jsx-props-no-spreading */
/* eslint-disable react/no-children-prop */
/* eslint-disable no-nested-ternary */
import React, { useCallback, useState, useMemo, useEffect } from 'react';
import { Tooltip } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import AllInclusiveOutlinedIcon from '@mui/icons-material/AllInclusiveOutlined';
import GridViewOutlinedIcon from '@mui/icons-material/GridViewOutlined';
import TitleBar from 'frameless-titlebar';

import { remote } from 'electron';

import LayoutMenu from './layout';
import SettingView from '../../setting';
import { useFocusHelper } from '../../../utils/focushelper';

export declare type HeaderBarProps = {
  title?: string;
  fixed?: boolean;
  layouts?: boolean;
  focus?: boolean;
};

const HeaderBar = (props: HeaderBarProps) => {
  const { title, fixed, layouts, focus } = props;
  const [showSetting, setShowSetting] = useState(false);
  const [layoutMenuAnchor, setLayoutMenuAnchor] = useState<Element | null>(
    null
  );
  const showLayoutMenu = useMemo(
    () => Boolean(layoutMenuAnchor),
    [layoutMenuAnchor]
  );
  const currentWindow = remote.getCurrentWindow();
  const [maximized, setMaximized] = useState(currentWindow.isMaximized());
  const focusHelper = useFocusHelper();

  // add window listeners for currentWindow
  useEffect(() => {
    const onMaximized = () => setMaximized(true);
    const onRestore = () => setMaximized(false);
    currentWindow.on('maximize', onMaximized);
    currentWindow.on('unmaximize', onRestore);
    currentWindow.on('resized', onRestore);
    return () => {
      currentWindow.removeListener('maximize', onMaximized);
      currentWindow.removeListener('unmaximize', onRestore);
    };
  }, []);

  // used by double click on the titlebar
  // and by the maximize control button
  const handleMaximize = () => {
    if (maximized) {
      currentWindow.restore();
    } else {
      currentWindow.maximize();
    }
  };

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
    <>
      {fixed !== true ? (
        <div
          className="headerbar-holder"
          style={{
            position: 'relative',
            boxSizing: 'border-box',
            width: '100%',
            height: window.process.platform === 'darwin' ? '36px' : '28px',
            minHeight: window.process.platform === 'darwin' ? '36px' : '28px',
          }}
        />
      ) : (
        <></>
      )}
      <div
        className="headerbar"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: window.process.platform === 'darwin' ? -60 : 0,
          zIndex: 999,
          boxSizing: 'border-box',
          margin: process.platform === 'win32' ? '4px 4px' : '',
        }}
        {...focusHelper}
      >
        <TitleBar
          icon={<AllInclusiveOutlinedIcon color="primary" fontSize="small" />}
          title={`Agora Meeting${title ? ': ' : ''}${title || ''}`}
          currentWindow={currentWindow} // electron window instance
          platform={window.process.platform as any}
          onMinimize={() => currentWindow.minimize()}
          onMaximize={handleMaximize}
          // when the titlebar is double clicked
          onDoubleClick={handleMaximize}
          onClose={() => currentWindow.close()}
          // hide minimize windows control
          disableMinimize={false}
          // hide maximize windows control
          disableMaximize={false}
          // is the current window maximized?
          maximized={maximized}
          theme={{
            bar: {
              palette: 'light',
              height: window.process.platform === 'darwin' ? 36 : 28,
              // background: '#FFFFFFFF',
              borderBottom: '0px',
              title: {
                fontFamily: '"Roboto","Helvetica","Arial",sans-serif',
                fontWeight: 800,
                color: 'black',
              },
            },
          }}
          children={
            <>
              <div className="headerbar-controls">
                {layouts ? (
                  <>
                    <Tooltip arrow title="AttendeeView Layout">
                      <IconButton
                        id="layout-button"
                        aria-controls={
                          showLayoutMenu ? 'layout-menu' : undefined
                        }
                        aria-haspopup="true"
                        aria-expanded={showLayoutMenu ? 'true' : undefined}
                        onClick={onLayoutClicked}
                      >
                        <GridViewOutlinedIcon
                          color="primary"
                          fontSize="small"
                        />
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
                    <SettingsOutlinedIcon color="primary" fontSize="small" />
                  </IconButton>
                </Tooltip>
              </div>
            </>
          }
        />
      </div>
      <SettingView
        open={showSetting}
        onClose={() => {
          setShowSetting(false);
        }}
      />
    </>
  );
};

export default HeaderBar;
