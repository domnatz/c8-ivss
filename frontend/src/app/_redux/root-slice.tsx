import { RootState } from './root-state';
import { createSlice } from '@reduxjs/toolkit';

export const initialState: RootState = {
  menuOpen: false,
};

export const rootSlice = createSlice({
  name: 'rootSlice',
  initialState,
  reducers: {
    collapseToggled(state: RootState) {
      return {
        ...state,
        menuOpen: !state.menuOpen,
      };
    },
  },
});

export const rootActions = rootSlice.actions;

export default rootSlice.reducer;
