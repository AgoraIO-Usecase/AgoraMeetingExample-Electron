import { Select, SelectProps } from '@mui/material';
import { styled } from '@mui/material/styles';

const DeviceSelect = styled(Select)<SelectProps>(() => ({
  '& .MuiOutlinedInput-input': {
    padding: '8px 14px',
  },
}));

export default DeviceSelect;
