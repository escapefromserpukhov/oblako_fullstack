import { createSlice } from "@reduxjs/toolkit";

export const appSlice = createSlice({
  name: "app",
  initialState: {
    isLoading: true,
  },
  reducers: {
    setLoading: (state, { payload }) => {
      state.isLoading = payload;
    },
  },
});
