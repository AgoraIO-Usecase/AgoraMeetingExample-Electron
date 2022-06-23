import { makeStyles, createStyles } from '@mui/styles';

const useStyle = makeStyles(() => {
  return createStyles({
    toolBar: { padding: 6, boxSizing: 'border-box', background: '#FFFFFFFF' },
  });
});

export default useStyle;
