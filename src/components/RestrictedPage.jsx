import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { UserContext } from "../UserContext";

const RestrictedPage = ({ allowedRoles, children }) => {
  const { currentUser, role } = useContext(UserContext);

  // Pārbauda, vai pašreizējā lietotāja loma ir atļauta
  const hasAllowedRole = allowedRoles.includes(role);

  // Ja lietotājs nav pieslēdzies vai viņa loma nav atļauta, pāradresē uz ielogošanās lapu
  if (!currentUser || !hasAllowedRole) {
    return <Navigate to="/login" />;
  }
  // Pretējā gadījumā attēlo bērnu komponentus
  return <>{children}</>;
};

export default RestrictedPage;
