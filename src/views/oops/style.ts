import { makeStyles, createStyles } from '@mui/styles';

const useStyle = makeStyles(() => {
  return createStyles({
    wrapper: {
      background: '#FFFFFF',
      width: '100%',
      height: '100%',
      boxSizing: 'border-box',
    },
  });
});

export default useStyle;
