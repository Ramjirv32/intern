import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Search, Share, Eye, ChevronDown, LogOut, User, Bell, Settings, MapPin } from 'lucide-react';
import karma from "../images/karma.png";
import sara from "../images/sara.png";
import red from "../images/red.png";
import j from "../images/j.png";
import m from "../images/m.png";
import door from "../images/door.png";
import car from "../images/car.png";
import axios from 'axios';
import Swal from 'sweetalert2';

const getApiUrl = () => {
  return 'http://localhost:5000/api';
};

const API_URL = getApiUrl();

const handleApiError = (error) => {
  if (error.code === 'ERR_NETWORK') {
    localStorage.setItem('apiPort', '5001');
    window.location.reload();
  }
  console.error('API Error:', error);
};

[... rest of the file without comments ...]

