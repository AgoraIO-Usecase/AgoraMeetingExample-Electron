import { useCallback, useEffect } from 'react';
import { ipcRenderer } from 'electron';
import { AttendeeLayoutType, StoreActionType, useStore } from '../hooks';

export const useFocusHelper = () => {
  const { state } = useStore();
  const onMouseEnter = useCallback(() => {
    if (!state.focusMode || state.markable) {
      return;
    }
    ipcRenderer.send(
      'set-ignore-mouse-events',
      false,
      { forward: false },
      { source: 'onMouseEnter' }
    );
  }, [state.focusMode, state.markable]);

  const onMouseLeave = useCallback(() => {
    if (!state.focusMode || state.markable) {
      return;
    }
    ipcRenderer.send(
      'set-ignore-mouse-events',
      true,
      { forward: true },
      { source: 'onMouseLeave' }
    );
  }, [state.focusMode, state.markable]);

  useEffect(() => {
    if (!state.focusMode) {
      return;
    }
    if (state.markable) {
      ipcRenderer.send(
        'set-ignore-mouse-events',
        false,
        { forward: false },
        { source: 'useEffect' }
      );
    } else {
      ipcRenderer.send(
        'set-ignore-mouse-events',
        true,
        { forward: true },
        { source: 'useEffect' }
      );
    }
  }, [state.focusMode, state.markable]);

  return { onMouseEnter, onMouseLeave };
};

export const useClearFocusMode = () => {
  const { state, dispatch } = useStore();

  const clearFocusMode = useCallback(() => {
    dispatch({
      type: StoreActionType.ACTION_TYPE_FOCUS_MODE,
      payload: { focusMode: false, isDisplay: false, targetId: 0 },
    });
    dispatch({
      type: StoreActionType.ACTION_TYPE_ATTENDEE_LAYOUT,
      payload: AttendeeLayoutType.Speaker,
    });
  }, [state.focusMode]);

  return { clearFocusMode };
};

export const useSwitchMarkable = () => {
  const { state, dispatch } = useStore();
  const switchMarkable = useCallback(() => {
    if (!state.focusMode) return;

    dispatch({
      type: StoreActionType.ACTION_TYPE_MARKABLE,
      payload: !state.markable,
    });
  }, [state.focusMode, state.markable]);

  return { switchMarkable };
};

export default {};
