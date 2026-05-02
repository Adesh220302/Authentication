import React, { createContext, useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

export const AppContext = createContext();

export const AppContextProvider = (props) => {

  axios.defaults.withCredentials = true;
  const backend_url = import.meta.env.VITE_BACKEND_URL;
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userdata, setUserdata] = useState(false);
  
  const getAuthStatus = async () => {
    try {
      axios.defaults.withCredentials = true;
      const { data } = await axios.get(backend_url + "/api/auth/is-auth");
      if (data.success) {
        setIsLoggedIn(true);
        getUserdata();
      } else {
        setIsLoggedIn(false);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const getUserdata = async () => {
    try {
      axios.defaults.withCredentials = true;
      const { data } = await axios.get(backend_url + "/api/user/data");
      data.success ? setUserdata(data.userdata) : toast.error(data.message);
    } catch (err) {
      toast.error(err.message);
    }
  };

  useEffect(() => {
    getAuthStatus();
  }, []);

  const value = {
    backend_url,
    isLoggedIn,
    setIsLoggedIn,
    userdata,
    setUserdata,
    getUserdata,
  };

  return <AppContext.Provider value={value}>{props.children}</AppContext.Provider>;
};
