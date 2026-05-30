import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { products, banners, categories } from '../mock';

export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async (_, { rejectWithValue }) => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      return products;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchProductById = createAsyncThunk(
  'products/fetchProductById',
  async (id, { rejectWithValue }) => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 300));
      const product = products.find((p) => p.id === parseInt(id));
      if (!product) {
        return rejectWithValue('商品不存在');
      }
      return product;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  products: [],
  banners: banners,
  categories: categories,
  currentProduct: null,
  loading: false,
  error: null,
};

const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    setCurrentProduct: (state, action) => {
      state.currentProduct = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchProductById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProductById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentProduct = action.payload;
      })
      .addCase(fetchProductById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setCurrentProduct } = productSlice.actions;

export const selectAllProducts = (state) => state.products.products;
export const selectBanners = (state) => state.products.banners;
export const selectCategories = (state) => state.products.categories;
export const selectCurrentProduct = (state) => state.products.currentProduct;
export const selectProductsLoading = (state) => state.products.loading;
export const selectProductsError = (state) => state.products.error;
export const selectHotProducts = (state) =>
  state.products.products.filter((p) => p.isHot).slice(0, 8);
export const selectNewProducts = (state) =>
  state.products.products.filter((p) => p.isNew).slice(0, 8);
export const selectProductsByCategory = (categoryId) => (state) =>
  state.products.products.filter((p) => p.categoryId === parseInt(categoryId));

export default productSlice.reducer;
