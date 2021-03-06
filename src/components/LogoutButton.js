import { useAuth0 } from "@auth0/auth0-react";
import React from "react";

const LogoutButton = (props) => {
  const { logout } = useAuth0();

  return (
    <button
      onClick={() => logout({ returnTo: window.location.origin })}
      {...props}
    >
      Log Out
    </button>
  );
};

export default LogoutButton;
