import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import profileReducer from './profileSlice';
import gigsReducer from './gigsSlice';
import proposalsReducer from './proposalsSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    profile: profileReducer,
    gigs: gigsReducer,
    proposals: proposalsReducer
  }
});

export default store;
