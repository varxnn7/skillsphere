import { createSlice } from '@reduxjs/toolkit';

// Retrieve bookmarks from localStorage
let bookmarkedGigs = [];
try {
  const savedBookmarks = localStorage.getItem('bookmarkedGigs');
  if (savedBookmarks) {
    bookmarkedGigs = JSON.parse(savedBookmarks);
  }
} catch (e) {
  console.error('Error loading bookmarked gigs:', e);
}

const initialState = {
  gigs: [],
  myGigs: [],
  selectedGig: null,
  bookmarkedGigs,
  categories: [],
  skills: [],
  pagination: null,
  loading: false,
  error: null
};

const gigsSlice = createSlice({
  name: 'gigs',
  initialState,
  reducers: {
    gigsStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    gigsSuccess: (state, action) => {
      state.loading = false;
      state.gigs = action.payload.gigs;
      state.pagination = action.payload.pagination;
      state.error = null;
    },
    myGigsSuccess: (state, action) => {
      state.loading = false;
      state.myGigs = action.payload;
      state.error = null;
    },
    selectedGigSuccess: (state, action) => {
      state.loading = false;
      state.selectedGig = action.payload;
      state.error = null;
    },
    gigsFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    suggestionsSuccess: (state, action) => {
      state.categories = action.payload.categories || [];
      state.skills = action.payload.skills || [];
    },
    addBookmark: (state, action) => {
      const gig = action.payload;
      if (!state.bookmarkedGigs.some(g => g._id === gig._id)) {
        state.bookmarkedGigs.push(gig);
        localStorage.setItem('bookmarkedGigs', JSON.stringify(state.bookmarkedGigs));
      }
    },
    removeBookmark: (state, action) => {
      const gigId = action.payload;
      state.bookmarkedGigs = state.bookmarkedGigs.filter(g => g._id !== gigId);
      localStorage.setItem('bookmarkedGigs', JSON.stringify(state.bookmarkedGigs));
    },
    clearSelectedGig: (state) => {
      state.selectedGig = null;
    }
  }
});

export const {
  gigsStart,
  gigsSuccess,
  myGigsSuccess,
  selectedGigSuccess,
  gigsFailure,
  suggestionsSuccess,
  addBookmark,
  removeBookmark,
  clearSelectedGig
} = gigsSlice.actions;

export default gigsSlice.reducer;
