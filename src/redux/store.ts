import { applyMiddleware, combineReducers, createStore } from 'redux';
import thunk from 'redux-thunk';
import recorderReducer from './recorder';
import userEventsReducer from './user-events';
import { composeWithDevTools } from 'redux-devtools-extension';

const rootReducer = combineReducers({
  userEvents: userEventsReducer,
  recorder: recorderReducer,
});

export type RootState = ReturnType<typeof rootReducer>;

const store = createStore(
  rootReducer,
  composeWithDevTools(applyMiddleware(thunk))
);

export default store;
