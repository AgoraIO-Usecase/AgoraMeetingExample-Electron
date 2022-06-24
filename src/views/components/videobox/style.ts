import { makeStyles, createStyles } from '@mui/styles';

const useStyle = makeStyles(() => {
  return createStyles({
    wrapper: {
      boxSizing: 'border-box',
      width: '100%',
      height: '100%',
      borderRadius: '4.75px',
      overflow: 'hidden',
      position: 'absolute',
    },
  });
});

export default useStyle;
