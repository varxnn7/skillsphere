import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  freelancerProfile: null,
  clientProfile: null,
  loading: false,
  error: null
};

const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    profileStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    freelancerProfileSuccess: (state, action) => {
      state.loading = false;
      state.freelancerProfile = action.payload;
      state.error = null;
    },
    clientProfileSuccess: (state, action) => {
      state.loading = false;
      state.clientProfile = action.payload;
      state.error = null;
    },
    profileFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    clearProfile: (state) => {
      state.freelancerProfile = null;
      state.clientProfile = null;
      state.loading = false;
      state.error = null;
    }
  }
});

export const {
  profileStart,
  freelancerProfileSuccess,
  clientProfileSuccess,
  profileFailure,
  clearProfile
} = profileSlice.actions;

export default profileSlice.reducer;
