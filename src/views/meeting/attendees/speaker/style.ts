import { makeStyles, createStyles } from '@mui/styles';

const useStyle = makeStyles(() => {
  return createStyles({
    wrapper: {
      boxSizing: 'border-box',
      width: '100%',
      height: '100%',
    },
    mainContainer: {
      boxSizing: 'border-box',
      width: '100%',
      height: '100%',
      position: 'relative',
    },
    listContainer: {
      position: 'relative',
      boxSizing: 'border-box',
      height: '100%',
      right: '0px',
      width: '160px',
      minWidth: '160px',
      maxWidth: '160px',
    },
    sliderContainer: {
      position: 'absolute',
      boxSizing: 'border-box',
      right: '0px',
      height: '100%',
      padding: '48px 4px 48px 4px',
      pointerEvents: 'none',
      zIndex: '9999',
    },
    slider: {
      pointerEvents: 'auto',
    },
  });
});

export default useStyle;
