import { makeStyles, createStyles } from '@mui/styles';

const useStyle = makeStyles(() => {
  return createStyles({
    mainWrapper: {
      background: '#FFFFFF',
      width: '100%',
      height: '100%',
    },
    focusedMainWrapper: {
      width: '100%',
      height: '100%',
    },
    titleBar: {
      position: 'absolute',
      left: 0,
      top: 0,
      right: 0,
      padding: 6,
      height: 52,
    },
  });
});

export default useStyle;
