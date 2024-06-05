// frontend2/src/redux/actions/userActions.ts

import axios from 'axios';
import { createAction, PayloadAction } from '@reduxjs/toolkit';

export const fetchUsersRequest = createAction('users/fetchUsersRequest');
export const fetchUsersSuccess = createAction<any[]>('users/fetchUsersSuccess'); // replace 'any' with the type of your user
export const fetchUsersFailure = createAction<string>('users/fetchUsersFailure');

export const fetchUsers = () => {
  return async (dispatch) => {
    dispatch(fetchUsersRequest());
    try {
      const response = await axios.get('/api/users/');
      dispatch(fetchUsersSuccess(response.data));
    } catch (error) {
      dispatch(fetchUsersFailure(error.message));
    }
  };
};

export type UserActionTypes = PayloadAction<any[]> | PayloadAction<string>; // replace 'any' with the type of your user