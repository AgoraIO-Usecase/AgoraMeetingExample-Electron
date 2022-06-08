import { makeStyles, createStyles } from '@mui/styles';

const useStyle = makeStyles(() => {
  return createStyles({
    wrapper: {
      width: '100%',
      height: '100%',
      boxSizing: 'border-box',
      alignItems: 'center',
    },
    grid: {
      width: '100%',
      height: '100%',
      boxSizing: 'border-box',
      display: 'grid',
      gridGap: '10px 10px',
      justifyContent: 'stretch',
      alignItems: 'stretch',
      // background: '#2f2f2f',
    },
  });
});

export default useStyle;
