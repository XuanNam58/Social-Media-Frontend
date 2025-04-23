import React from 'react';
import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import AuthForm from './pages/AuthForm';
import Profile from './pages/Profile';

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/auth" element={<AuthForm />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/:username" element={<Profile />} />
    </Routes>
  );
};

export default App; 