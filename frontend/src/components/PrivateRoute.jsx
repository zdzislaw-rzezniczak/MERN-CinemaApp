import { Navigate } from 'react-router-dom';

// eslint-disable-next-line react/prop-types
const PrivateRoute = ({ token, children }) => {
    return token ? children : <Navigate to="/" />;
};

export default PrivateRoute;
