import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { mockCollections, mockQuestions } from '../../mock';

const initialState = {
  collections: mockCollections,
  questions: mockQuestions,
  loading: false,
  error: null,
  userWorks: [],
};

export const fetchCollections = createAsyncThunk(
  'community/fetchCollections',
  async (userId) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockCollections.filter(c => c.userId === userId);
  }
);

export const createCollection = createAsyncThunk(
  'community/createCollection',
  async (collectionData, { getState }) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const { collections } = getState().community;
    const newCollection = {
      id: collections.length + 1,
      ...collectionData,
      works: [],
      createdAt: new Date().toISOString().split('T')[0],
    };
    return newCollection;
  }
);

export const addToCollection = createAsyncThunk(
  'community/addToCollection',
  async ({ collectionId, workId }) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return { collectionId, workId };
  }
);

export const removeFromCollection = createAsyncThunk(
  'community/removeFromCollection',
  async ({ collectionId, workId }) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return { collectionId, workId };
  }
);

export const addQuestion = createAsyncThunk(
  'community/addQuestion',
  async (questionData, { getState }) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const { questions } = getState().community;
    const newQuestion = {
      id: questions.length + 1,
      ...questionData,
      answers: [],
      views: 0,
      createdAt: new Date().toISOString().split('T')[0],
    };
    return newQuestion;
  }
);

export const addAnswer = createAsyncThunk(
  'community/addAnswer',
  async ({ questionId, answerData }) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return { questionId, answerData };
  }
);

const communitySlice = createSlice({
  name: 'community',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCollections.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCollections.fulfilled, (state, action) => {
        state.loading = false;
        state.collections = action.payload;
      })
      .addCase(createCollection.fulfilled, (state, action) => {
        state.collections.push(action.payload);
      })
      .addCase(addToCollection.fulfilled, (state, action) => {
        const collection = state.collections.find(c => c.id === action.payload.collectionId);
        if (collection && !collection.works.includes(action.payload.workId)) {
          collection.works.push(action.payload.workId);
        }
      })
      .addCase(removeFromCollection.fulfilled, (state, action) => {
        const collection = state.collections.find(c => c.id === action.payload.collectionId);
        if (collection) {
          collection.works = collection.works.filter(id => id !== action.payload.workId);
        }
      })
      .addCase(addQuestion.fulfilled, (state, action) => {
        state.questions.unshift(action.payload);
      })
      .addCase(addAnswer.fulfilled, (state, action) => {
        const question = state.questions.find(q => q.id === action.payload.questionId);
        if (question) {
          question.answers.push({
            id: question.answers.length + 1,
            ...action.payload.answerData,
            createdAt: new Date().toISOString().split('T')[0],
          });
        }
      });
  },
});

export default communitySlice.reducer;
