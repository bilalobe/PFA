// userReducer.ts

interface User {
  // Define the properties of a User here
  // For example:
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  grade: string;
  cumulativescore: number;
  // Add more properties as needed
}

interface Sort {
  field: string;
  direction: 'asc' | 'desc';
}

interface UserState {
  all: User[];
  loading: boolean;
  sort: Sort;
}

const initialState: UserState = {
  all: [],
  loading: false,
  sort: { field: '', direction: 'asc' },
};

interface Action {
  type: string;
  payload: any;
}

function userReducer(state: UserState = initialState, action: Action): UserState {
  switch (action.type) {
    case 'FETCH_USERS':
      return { ...state, all: action.payload, loading: false };
    case 'LOADING_USERS':
      return { ...state, loading: true };
    case 'SORT_USERS':
      const sortedUsers = [...state.all].sort((a: User, b: User) => {
        if (action.payload.field) {
          const aValue = a[action.payload.field as keyof User];
          const bValue = b[action.payload.field as keyof User];

          if (aValue < bValue) {
            return action.payload.direction === 'asc' ? -1 : 1;
          }
          if (aValue > bValue) {
            return action.payload.direction === 'asc' ? 1 : -1;
          }
        }
        return 0;
      });
      return { ...state, all: sortedUsers, sort: action.payload };

    default:
      return state;
  }
}

export default userReducer;