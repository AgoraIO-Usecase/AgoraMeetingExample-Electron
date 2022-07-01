import React, { useEffect, useMemo } from 'react';
import { Grid, Stack, Pagination } from '@mui/material';

import AttendeeItem from '../attendee';
import { useStore, AttendeeLayoutType } from '../../../../hooks';
import useStyle from './style';

const GridAttendeeView = () => {
  const style = useStyle();
  const { state } = useStore();

  const maxAttendeeCountPerPage = useMemo(() => {
    let count = 4;
    switch (state.attendeeLayout) {
      case AttendeeLayoutType.Grid4:
        count = 4;
        break;
      case AttendeeLayoutType.Grid9:
        count = 9;
        break;
      case AttendeeLayoutType.Grid25:
        count = 25;
        break;
      default:
        break;
    }

    return count;
  }, [state.attendeeLayout]);

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

  const totalPage = useMemo(() => {
    return Math.ceil(state.attendees.length / maxAttendeeCountPerPage);
  }, [state, maxAttendeeCountPerPage]);

  const [currentPage, setCurrentPage] = React.useState(1);
  const onPageChange = (_event: React.ChangeEvent<unknown>, value: number) => {
    setCurrentPage(value);
  };

  useEffect(() => {
    if (currentPage > totalPage) setCurrentPage(totalPage);
  }, [totalPage]);

  const currentAttendees = useMemo(() => {
    return state.attendees.slice(
      (currentPage - 1) * maxAttendeeCountPerPage,
      Math.min(state.attendees.length, currentPage * maxAttendeeCountPerPage)
    );
  }, [currentPage, maxAttendeeCountPerPage, state]);

  return (
    <Stack className={style.wrapper} spacing={1}>
      <div className={style.grid} style={gridStyle}>
        {currentAttendees.map((item, index) => (
          <Grid item key={index} id={`grid-attendee-item-${item.uid}`}>
            <AttendeeItem attendee={item} isFit />
          </Grid>
        ))}
      </div>
      <Pagination
        count={totalPage}
        page={currentPage}
        onChange={onPageChange}
      />
    </Stack>
  );
};

export default GridAttendeeView;
