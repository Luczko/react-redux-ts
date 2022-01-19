import { Action, AnyAction } from 'redux';
import { ThunkAction } from 'redux-thunk';
import { selectDateStart } from './recorder';
import { RootState } from './store';

export interface UserEvent {
  id: number;
  title: string;
  dateStart: string;
  dateEnd: string;
}

export interface UserEventsState {
  byIds: Record<UserEvent['id'], UserEvent>;
  allIds: UserEvent['id'][];
}

const LOAD_REQUEST = 'userEvents/load_request';
const LOAD_SUCCESS = 'userEvents/load_success';
const LOAD_ERROR = 'userEvents/load_error';

interface LoadRequestAction extends Action<typeof LOAD_REQUEST> {}
interface LoadSuccessAction extends Action<typeof LOAD_SUCCESS> {
  payload: {
    events: UserEvent[];
  };
}
interface LoadErrorAction extends Action<typeof LOAD_ERROR> {
  error: string;
}

export const loadUserEvents =
  (): ThunkAction<
    void,
    RootState,
    undefined,
    LoadRequestAction | LoadSuccessAction | LoadErrorAction
  > =>
  async (dispatch, getState) => {
    dispatch({
      type: LOAD_REQUEST,
    });

    try {
      const response = await fetch('http://localhost:3001/events');
      const events: UserEvent[] = await response.json();

      dispatch({
        type: LOAD_SUCCESS,
        payload: { events },
      });
    } catch (e) {
      dispatch({
        type: LOAD_ERROR,
        error: 'Failed to load events.',
      });
    }
  };

const CREATE_REQUEST = 'userEvents/create_request';
const CREATE_SUCCESS = 'userEvents/create_success';
const CREATE_ERROR = 'userEvents/create_error';

interface CreateRequestAction extends Action<typeof CREATE_REQUEST> {}
interface CreateSuccessAction extends Action<typeof CREATE_SUCCESS> {
  payload: {
    event: UserEvent;
  };
}
interface CreateErrorAction extends Action<typeof CREATE_ERROR> {
  error: string;
}

export const createUserEvent =
  (): ThunkAction<
    Promise<void>,
    RootState,
    undefined,
    CreateRequestAction | CreateSuccessAction | CreateErrorAction
  > =>
  async (dispatch, getState) => {
    dispatch({
      type: CREATE_REQUEST,
    });

    try {
      const dateStart = selectDateStart(getState());
      const event: Omit<UserEvent, 'id'> = {
        title: 'No name',
        dateStart,
        dateEnd: new Date().toISOString(),
      };

      const response = await fetch('http://localhost:3001/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event),
      });
      const createdEvent: UserEvent = await response.json();

      dispatch({
        type: CREATE_SUCCESS,
        payload: { event: createdEvent },
      });
    } catch (e) {
      dispatch({
        type: CREATE_ERROR,
        error: 'Creating error',
      });
    }
  };

const DELETE_REQUEST = 'userEvents/delete_request';
const DELETE_SUCCESS = 'userEvents/delete_success';
const DELETE_ERROR = 'userEvents/delete_error';

interface DeleteRequestAction extends Action<typeof DELETE_REQUEST> {}
interface DeleteSuccessAction extends Action<typeof DELETE_SUCCESS> {
  payload: { id: UserEvent['id'] };
}
interface DeleteErrorAction extends Action<typeof DELETE_ERROR> {
  error: string;
}

export const deleteUserEvent =
  (
    id: UserEvent['id']
  ): ThunkAction<
    Promise<void>,
    RootState,
    undefined,
    DeleteRequestAction | DeleteSuccessAction | DeleteErrorAction
  > =>
  async (dispatch) => {
    dispatch({
      type: DELETE_REQUEST,
    });

    try {
      const response = await fetch(`http://localhost:3001/events/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        dispatch({
          type: DELETE_SUCCESS,
          payload: { id },
        });
      }
    } catch (e) {
      dispatch({
        type: DELETE_ERROR,
        error: 'Deleting error',
      });
    }
  };

const selectUserEventsState = (rootState: RootState) => rootState.userEvents;

export const selectUserEventsArray = (rootState: RootState) => {
  const state = selectUserEventsState(rootState);
  return state.allIds.map((id) => state.byIds[id]);
};

const initialState: UserEventsState = {
  byIds: {},
  allIds: [],
};

const userEventsReducer = (
  state: UserEventsState = initialState,
  action: LoadSuccessAction | CreateSuccessAction | DeleteSuccessAction
) => {
  switch (action.type) {
    case LOAD_SUCCESS:
      const { events } = action.payload;
      return {
        ...state,
        allIds: events.map(({ id }) => id),
        byIds: events.reduce<UserEventsState['byIds']>((byIds, event) => {
          byIds[event.id] = event;
          return byIds;
        }, {}),
      };
    case CREATE_SUCCESS:
      const { event } = action.payload;
      return {
        ...state,
        allIds: [...state.allIds, event.id],
        byIds: { ...state.byIds, [event.id]: event },
      };
    case DELETE_SUCCESS:
      const { id } = action.payload;
      const newState = {
        ...state,
        byIds: { ...state.byIds },
        allIds: state.allIds.filter((storedId) => storedId !== id),
      };
      delete newState.byIds[id];
      return newState;
    default:
      return state;
  }
};

export default userEventsReducer;
