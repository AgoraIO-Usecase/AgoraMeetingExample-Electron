import { makeStyles, createStyles } from '@mui/styles';

const useStyle = makeStyles(() => {
  return createStyles({
    wrapper: {
      boxSizing: 'border-box',
      width: '100%',
      height: '100%',
      padding: '4px 4px',
    },
  });
});

export default useStyle;
