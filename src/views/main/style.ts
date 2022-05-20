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
