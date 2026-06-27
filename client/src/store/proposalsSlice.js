import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  proposals: [],
  myProposals: [],
  selectedProposal: null,
  loading: false,
  error: null
};

const proposalsSlice = createSlice({
  name: 'proposals',
  initialState,
  reducers: {
    proposalsStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    proposalsSuccess: (state, action) => {
      state.loading = false;
      state.proposals = action.payload;
      state.error = null;
    },
    myProposalsSuccess: (state, action) => {
      state.loading = false;
      state.myProposals = action.payload;
      state.error = null;
    },
    selectedProposalSuccess: (state, action) => {
      state.loading = false;
      state.selectedProposal = action.payload;
      state.error = null;
    },
    proposalsFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    clearProposalState: (state) => {
      state.selectedProposal = null;
      state.proposals = [];
      state.loading = false;
      state.error = null;
    }
  }
});

export const {
  proposalsStart,
  proposalsSuccess,
  myProposalsSuccess,
  selectedProposalSuccess,
  proposalsFailure,
  clearProposalState
} = proposalsSlice.actions;

export default proposalsSlice.reducer;
