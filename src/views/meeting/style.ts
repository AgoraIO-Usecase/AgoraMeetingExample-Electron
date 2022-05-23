import { makeStyles, createStyles } from '@mui/styles';

const useStyle = makeStyles(() => {
  return createStyles({
    mainWrapper: {
      background: '#FFFFFF',
    },
    titleBar: {
      position: 'absolute',
      left: 0,
      top: 0,
      right: 0,
      padding: 6,
      height: 52,
    },
    viewContainer: {
      background: '#F3F3F3',
    },
    toolBar: { padding: 6, boxSizing: 'border-box' },
    toolButton: {},
  });
});

export default useStyle;
