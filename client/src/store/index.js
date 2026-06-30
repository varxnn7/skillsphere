import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import profileReducer from './profileSlice';
import gigsReducer from './gigsSlice';
import proposalsReducer from './proposalsSlice';
import messagesReducer from './messagesSlice';
import notificationsReducer from './notificationsSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    profile: profileReducer,
    gigs: gigsReducer,
    proposals: proposalsReducer,
    messages: messagesReducer,
    notifications: notificationsReducer
  }
});

export default store;
