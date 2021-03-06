import { useAuth0 } from "@auth0/auth0-react";
import { useState } from "react";
import LoadingSpinner from "./LoadingSpinner";

import LoginButton from "./LoginButton";
import ProfileDropdown from "./ProfileDropdown";
import renderModal from "./renderModal";

export default function Navbar() {
  const { isAuthenticated, user, logout, isLoading } = useAuth0();
  const [modal, setModal] = useState("");
  return (
    <div className="stickyTop">
      {isLoading ? <LoadingSpinner /> : null}
      {renderModal(modal, () => setModal(""))}
      <div className="nav-container">
        <nav className="nav">
          <div className="title">Airbeds</div>
          {isAuthenticated && !isLoading ? (
            <ProfileDropdown
              picture={user.picture}
              username={user.given_name}
              actions={[
                {
                  text: "Logout",
                  icon: <i className="fa fa-sign-out"></i>,
                  onClick: () => logout({ returnTo: window.location.origin }),
                },
                {
                  text: "Change roles",
                  icon: <i className="fa fa-exchange"></i>,
                  onClick: () => setModal("role-switch"),
                },
                {
                  text: "Add listing",
                  icon: <i className="fa fa-plus"></i>,
                  onClick: () => setModal("listing-form"),
                },
              ]}
            />
          ) : (
            <LoginButton className="btn btn--primary bold uppercase" />
          )}
        </nav>
      </div>
    </div>
  );
}
