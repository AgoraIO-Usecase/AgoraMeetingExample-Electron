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
    },
    videoBoxListContainer: {
      width: '160px',
      minWidth: '160px',
      maxWidth: '160px',
      height: '100%',
    },
  });
});

export default useStyle;
