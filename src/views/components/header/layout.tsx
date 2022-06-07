import React from 'react';
import { Menu, MenuItem, ListItemIcon, ListItemText } from '@mui/material';
import Check from '@mui/icons-material/Check';
import { AttendeeLayoutType, StoreActionType, useStore } from '../../../hooks';

export type LayoutMenuProps = {
  id: string;
  anchor: Element | null;
  anchorId: string;
  open: boolean;
  onClose: () => void;
};

const LayoutTypeArray: { type: AttendeeLayoutType; name: string }[] = [
  { type: AttendeeLayoutType.Speaker, name: 'Speaker Layout' },
  { type: AttendeeLayoutType.Grid9, name: '3x3 Grid Layout' },
  { type: AttendeeLayoutType.Grid25, name: '5x5 Grid Layout' },
];

const LayoutMenuItem = (props: {
  type: AttendeeLayoutType;
  name: string;
  isSelected: boolean;
  onSelect: (type: AttendeeLayoutType) => void;
}) => {
  const { type, name, isSelected, onSelect } = props;

  return (
    <MenuItem onClick={() => onSelect(type)}>
      {isSelected ? (
        <>
          <ListItemIcon>
            <Check />
          </ListItemIcon>
          {name}
        </>
      ) : (
        <ListItemText inset>{name}</ListItemText>
      )}
    </MenuItem>
  );
};

const LayoutMenu = (props: LayoutMenuProps) => {
  const { id, anchor, anchorId, open, onClose } = props;
  const { state, dispatch } = useStore();

  const onLayoutTypeSelected = (type: AttendeeLayoutType) => {
    dispatch({
      type: StoreActionType.ACTION_TYPE_ATTENDEE_LAYOUT,
      payload: type,
    });

    onClose();
  };

  return (
    <Menu
      id={id}
      anchorEl={anchor}
      open={open}
      onClose={onClose}
      MenuListProps={{
        'aria-labelledby': anchorId,
      }}
    >
      {LayoutTypeArray.map((item, index) => (
        <LayoutMenuItem
          key={index}
          type={item.type}
          name={item.name}
          isSelected={item.type === state.attendeeLayout}
          onSelect={onLayoutTypeSelected}
        />
      ))}
    </Menu>
  );
};

export default LayoutMenu;
