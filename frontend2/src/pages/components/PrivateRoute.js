import React from 'react';
import { Route, Redirect } from 'next/router';
import { useSelector } from 'react-redux';

function PrivateRoute({ component: Component, ...rest }) {
  const user = useSelector((state) => state.user);

  return (
    <Route
      {...rest}
      render={(props) =>
        user ? (
          <Component {...props} />
        ) : (
          <Redirect to={{ pathname: '/login', state: { from: props.location } }} />
        )
      }
    />
  );
}

export default PrivateRoute;