import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './components/af';
import GroupPosts from './components/GrouPosts';
import SignIn from './components/SignIn.jsx';
import CreateAccount from './components/CreateAccount.jsx';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<GroupPosts />} />
        <Route 
          path="/Home" 
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          } 
        />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/create-account" element={<CreateAccount />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
