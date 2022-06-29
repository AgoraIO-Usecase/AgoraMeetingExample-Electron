import { makeStyles, createStyles } from '@mui/styles';

const useStyle = makeStyles(() => {
  return createStyles({
    mainWrapper: {
      background: '#FFFFFF',
      position: 'absolute',
      left: '0px',
      top: '0px',
      right: '0px',
      bottom: '0px',
      boxSizing: 'border-box',
    },
    mainWrapperShadow: {
      margin: '4px 4px',
      boxShadow:
        'rgb(0 0 0 / 20%) 0px 3px 3px -2px, rgb(0 0 0 / 14%) 0px 3px 4px 0px, rgb(0 0 0 / 12%) 0px 1px 8px 0px',
    },
    titleBar: {
      position: 'absolute',
      left: 0,
      top: 0,
      right: 0,
      padding: 6,
      height: 52,
    },
    containerSubmit: {
      padding: 8,
    },
    containerCheckBoxes: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 8,
    },
  });
});

export default useStyle;
