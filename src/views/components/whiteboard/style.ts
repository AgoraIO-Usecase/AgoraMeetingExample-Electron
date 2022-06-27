import { makeStyles, createStyles } from '@mui/styles';

const useStyle = makeStyles(() => {
  return createStyles({
    wrapper: {
      boxSizing: 'border-box',
      width: '100%',
      height: '100%',
    },
    whiteboard: {
      boxSizing: 'border-box',
      width: '100%',
      height: '100%',
    },
  });
});

export default useStyle;
