import React, { createContext, useState, useEffect } from "react";

const UserContext = createContext();

const UserProvider = ({ children }) => {
  const [userData, setUserData] = useState({
    email: "",
    role: "",
    firstname: "",
    lastname: "",
    userId: ""
  });

  const fetchCurrentUser = async () => {
    try {
      const response = await fetch(
        "http://localhost:8000/api/users/get-email",
        {
          credentials: "include",
        }
      );
      if (response.ok) {
        const data = await response.json();
        setUserData(data);
      } else {
        console.error("Failed to fetch current user");
      }
    } catch (error) {
      console.error("Error fetching current user:", error);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const handleLogin = () => {
    fetchCurrentUser();
  };

  const handleLogout = () => {
    setUserData({ email: "", role: "", firstname: "", lastname: "", userId: "" });
  };

  return (
    <UserContext.Provider
      value={{
        currentUser: userData.email,
        role: userData.role,
        firstname: userData.firstname,
        lastname: userData.lastname,
        id: userData.userId,
        handleLogin,
        handleLogout,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export { UserProvider, UserContext };
