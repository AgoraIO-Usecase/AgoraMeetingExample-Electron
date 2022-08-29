import { makeStyles, createStyles } from '@mui/styles';

const useStyle = makeStyles(() => {
  return createStyles({
    wrapper: {
      boxSizing: 'border-box',
      width: '100%',
      height: '100%',
    },
    whiteboard: {
      boxSizing: 'border-box',
      width: '100%',
      height: '100%',
    },
    whiteboardFocused: {
      boxSizing: 'border-box',
      position: 'absolute',
      left: '0px',
      top: '0px',
      width: '100%',
      height: '100%',
    },
  });
});

export default useStyle;
