// userReducer.js

const initialState = {
    all: [],
    loading: false,
    sort: { field: '', direction: 'asc' },
};

function userReducer(state = initialState, action) {
    switch (action.type) {
        case 'FETCH_USERS':
            return { ...state, all: action.payload, loading: false };
        case 'LOADING_USERS':
            return { ...state, loading: true };
        case 'SORT_USERS':
            const sortedUsers = [...state.all].sort((a, b) => {
                if (action.payload.field) {
                    const aValue = a[action.payload.field];
                    const bValue = b[action.payload.field];

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