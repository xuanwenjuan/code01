import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { initialMessages } from '@/mock/data';

const getStoredMessages = () => {
  const stored = localStorage.getItem('messages');
  return stored ? JSON.parse(stored) : initialMessages;
};

export const fetchMessages = createAsyncThunk(
  'messages/fetchMessages',
  async techniqueId => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const allMessages = getStoredMessages();
    return allMessages.filter(m => m.techniqueId === techniqueId);
  }
);

export const addMessage = createAsyncThunk(
  'messages/addMessage',
  async ({ techniqueId, content, user }) => {
    await new Promise(resolve => setTimeout(resolve, 200));
    const allMessages = getStoredMessages();
    const newMessage = {
      id: Date.now(),
      techniqueId,
      userId: user.id,
      userName: user.name,
      userAvatar: user.avatar,
      content,
      time: new Date().toLocaleString('zh-CN'),
      replies: [],
    };
    const updatedMessages = [...allMessages, newMessage];
    localStorage.setItem('messages', JSON.stringify(updatedMessages));
    return newMessage;
  }
);

export const addReply = createAsyncThunk(
  'messages/addReply',
  async ({ messageId, content, user }) => {
    await new Promise(resolve => setTimeout(resolve, 200));
    const allMessages = getStoredMessages();
    const newReply = {
      id: Date.now(),
      userId: user.id,
      userName: user.name,
      userAvatar: user.avatar,
      content,
      time: new Date().toLocaleString('zh-CN'),
      isAdmin: user.role === 'admin',
    };
    const updatedMessages = allMessages.map(msg => {
      if (msg.id === messageId) {
        return { ...msg, replies: [...msg.replies, newReply] };
      }
      return msg;
    });
    localStorage.setItem('messages', JSON.stringify(updatedMessages));
    return { messageId, reply: newReply };
  }
);

const messagesSlice = createSlice({
  name: 'messages',
  initialState: {
    list: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(fetchMessages.pending, state => {
        state.loading = true;
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(addMessage.fulfilled, (state, action) => {
        state.list.push(action.payload);
      })
      .addCase(addReply.fulfilled, (state, action) => {
        const { messageId, reply } = action.payload;
        const message = state.list.find(m => m.id === messageId);
        if (message) {
          message.replies.push(reply);
        }
      });
  },
});

export default messagesSlice.reducer;
