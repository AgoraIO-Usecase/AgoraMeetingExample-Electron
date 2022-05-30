import { makeStyles, createStyles } from '@mui/styles';

const useStyle = makeStyles(() => {
  return createStyles({
    wrapper: {
      boxSizing: 'border-box',
      width: '100%',
      height: '100%',
    },
    videoBoxMainContainer: {
      boxSizing: 'border-box',
      width: '100%',
      height: '100%',
      position: 'relative',
    },
    videoBoxListContainer: {
      width: '160px',
      minWidth: '160px',
      maxWidth: '160px',
      height: '100%',
    },
    videoBoxListSwitchContainer: {
      position: 'absolute',
      boxSizing: 'border-box',
      right: '0px',
      height: '100%',
      padding: '4px 4px',
    },
  });
});

export default useStyle;
