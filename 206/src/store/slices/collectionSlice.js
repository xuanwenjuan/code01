import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  embroideries: JSON.parse(localStorage.getItem('collection_embroideries') || '[]'),
  tutorials: JSON.parse(localStorage.getItem('collection_tutorials') || '[]'),
};

const collectionSlice = createSlice({
  name: 'collection',
  initialState,
  reducers: {
    toggleEmbroideryCollection: (state, action) => {
      const embroidery = action.payload;
      const index = state.embroideries.findIndex((item) => item.id === embroidery.id);
      if (index > -1) {
        state.embroideries.splice(index, 1);
      } else {
        state.embroideries.push(embroidery);
      }
      localStorage.setItem('collection_embroideries', JSON.stringify(state.embroideries));
    },
    toggleTutorialCollection: (state, action) => {
      const tutorial = action.payload;
      const index = state.tutorials.findIndex((item) => item.id === tutorial.id);
      if (index > -1) {
        state.tutorials.splice(index, 1);
      } else {
        state.tutorials.push(tutorial);
      }
      localStorage.setItem('collection_tutorials', JSON.stringify(state.tutorials));
    },
    clearCollections: (state) => {
      state.embroideries = [];
      state.tutorials = [];
      localStorage.removeItem('collection_embroideries');
      localStorage.removeItem('collection_tutorials');
    },
  },
});

export const { toggleEmbroideryCollection, toggleTutorialCollection, clearCollections } =
  collectionSlice.actions;
export default collectionSlice.reducer;
