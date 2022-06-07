import React, { useMemo } from 'react';
import { Grid } from '@mui/material';

import AttendeeItem from '../attendee';
import { useStore, AttendeeLayoutType } from '../../../../hooks';
import useStyle from './style';

export type GridAttendeeViewProps = {
  type: AttendeeLayoutType;
};

const GridAttendeeView = (props: GridAttendeeViewProps) => {
  const { type } = props;
  const style = useStyle();
  const { state } = useStore();

  const maxAttendeeCountPerPage = useMemo(() => {
    if (type === AttendeeLayoutType.Grid25) return 25;
    return 9;
  }, [type]);

  const gridColumnRow = useMemo(() => {
    const info: { col: number; row: number } = {
      col: 1,
      row: 1,
    };

    if (state.attendees.length >= maxAttendeeCountPerPage) {
      info.row = Math.sqrt(maxAttendeeCountPerPage);
      info.col = info.row;
      return info;
    }

    info.row = Math.ceil(Math.sqrt(state.attendees.length));
    info.col = info.row;

    return info;
  }, [state, maxAttendeeCountPerPage]);

  const gridStyle = useMemo(() => {
    const { col, row } = gridColumnRow;
    return {
      gridTemplateColumns: `repeat(${col},1fr)`,
      gridTemplateRows: `repeat(${row},1fr)`,
    };
  }, [gridColumnRow]);

  return (
    <div className={style.wrapper} style={gridStyle}>
      {state.attendees.map((item, index) => (
        <Grid item key={index}>
          <AttendeeItem attendee={item} isFit />
        </Grid>
      ))}
    </div>
  );
};

export default GridAttendeeView;
