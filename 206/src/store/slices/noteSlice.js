import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  notes: JSON.parse(localStorage.getItem('learning_notes') || '[]'),
};

const noteSlice = createSlice({
  name: 'note',
  initialState,
  reducers: {
    addNote: (state, action) => {
      const newNote = {
        id: Date.now(),
        ...action.payload,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      state.notes.unshift(newNote);
      localStorage.setItem('learning_notes', JSON.stringify(state.notes));
    },
    updateNote: (state, action) => {
      const { id, content, title, tags } = action.payload;
      const index = state.notes.findIndex((note) => note.id === id);
      if (index > -1) {
        state.notes[index] = {
          ...state.notes[index],
          title,
          content,
          tags: tags || state.notes[index].tags,
          updatedAt: new Date().toISOString(),
        };
        localStorage.setItem('learning_notes', JSON.stringify(state.notes));
      }
    },
    deleteNote: (state, action) => {
      const id = action.payload;
      state.notes = state.notes.filter((note) => note.id !== id);
      localStorage.setItem('learning_notes', JSON.stringify(state.notes));
    },
    clearNotes: (state) => {
      state.notes = [];
      localStorage.removeItem('learning_notes');
    },
  },
});

export const { addNote, updateNote, deleteNote, clearNotes } = noteSlice.actions;
export default noteSlice.reducer;
