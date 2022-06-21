import { makeStyles, createStyles } from '@mui/styles';

const useStyle = makeStyles(() => {
  return createStyles({
    toolBar: { padding: 6, boxSizing: 'border-box' },
  });
});

export default useStyle;
