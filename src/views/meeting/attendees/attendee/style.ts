import { makeStyles, createStyles } from '@mui/styles';

const useStyle = makeStyles(() => {
  return createStyles({
    wrapper: {
      boxSizing: 'border-box',
      width: '100%',
      height: '100%',
      padding: '4px 4px',
    },
    container: {
      boxSizing: 'border-box',
      width: '100%',
      height: '100%',
      borderRadius: '4.75px',
      background: '#F3F3F3',
      transition: 'box-shadow 300ms cubic-bezier(0.4, 0, 0.2, 1) 0ms',
      position: 'relative',
      border: '2px solid  #23c34300',
    },
    speaker: {
      border: '2px solid  #23c343',
    },
    videobox: {
      boxSizing: 'border-box',
      width: '100%',
      height: '100%',
      borderRadius: '4.75px',
      overflow: 'hidden',
      position: 'absolute',
    },
    toolbar: {
      boxSizing: 'border-box',
      width: '100%',
      height: '32px',
      minHeight: '32px',
      background: '#1F2B2B2B',
      borderBottomLeftRadius: '4.75px',
      borderBottomRightRadius: '4.75px',
      zIndex: '1000',
      padding: '0px 6px',
    },
  });
});

export default useStyle;
