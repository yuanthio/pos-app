import { configureStore } from '@reduxjs/toolkit'
import makananReducer from './makananSlice'
import mejaReducer from './mejaSlice'

export const store = configureStore({
  reducer: {
    makanan: makananReducer,
    meja: mejaReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
