import { makeStyles, createStyles } from '@mui/styles';

const useStyle = makeStyles(() => {
  return createStyles({
    wrapper: {
      width: '100%',
      height: '100%',
      boxSizing: 'border-box',
      display: 'grid',
      gridGap: '10px 10px',
      justifyContent: 'stretch',
      alignItems: 'stretch',
      padding: '10px 10px',
      background: '#2f2f2f',
    },
  });
});

export default useStyle;
