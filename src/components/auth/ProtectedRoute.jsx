import React from 'react';
import { Navigate } from 'react-router-dom';

import { useAppContext } from '../../context/AppContext';

const ProtectedRoute = ({ children }) => {
    const { session } = useAppContext();
    if (!session) {
        return <Navigate to="/login" replace />;
    }

    return children;
};

export default ProtectedRoute;
