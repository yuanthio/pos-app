import { configureStore } from '@reduxjs/toolkit'
import makananReducer from './makananSlice'
import mejaReducer from './mejaSlice'
import pesananReducer from './pesananSlice'
import menuReducer from './menuSlice'

export const store = configureStore({
  reducer: {
    makanan: makananReducer,
    meja: mejaReducer,
    pesanan: pesananReducer,
    menu: menuReducer,
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
