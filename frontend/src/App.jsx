import React from 'react';
import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import AuthForm from './pages/AuthForm';
import Profile from './pages/Profile';
import ForgotPassword from './Pages/ForgotPassword';
import ChangePassword from './Pages/ChangePassword';
import { getAuth } from "firebase/auth";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import React, { useEffect, useState, useRef } from "react";
import { Toaster, toast } from 'sonner';



const App = () => {  
    return (     
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/auth" element={<AuthForm />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/:username" element={<Profile />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/change-password" element={<ChangePassword />} />
        </Routes>
    );
  
};

export default App; 