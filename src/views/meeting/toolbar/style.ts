import { makeStyles, createStyles } from '@mui/styles';

const useStyle = makeStyles(() => {
  return createStyles({
    toolBar: {
      padding: 6,
      boxSizing: 'border-box',
      background: '#FFFFFFFF',
    },
    draggableContainer: {
      position: 'absolute',
      top: '10px',
      right: '400px',
      cursor: 'move',
      zIndex: '1000',
      boxShadow:
        'rgb(0 0 0 / 20%) 0px 3px 3px -2px, rgb(0 0 0 / 14%) 0px 3px 4px 0px, rgb(0 0 0 / 12%) 0px 1px 8px 0px',
    },
  });
});

export default useStyle;
