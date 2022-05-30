import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import moment from "moment";
import {
  ReactiveBase,
  SearchBox,
  NumberBox,
  DateRange,
  RangeInput,
  SelectedFilters,
} from "@appbaseio/reactivesearch";
import { ReactiveGoogleMap } from "@appbaseio/reactivemaps";
import { Auth0Provider, useAuth0 } from "@auth0/auth0-react";

import "./App.css";
import "./Modal.css";
import LoginButton from "./LoginButton";
import ProfileDropdown from "./ProfileDropdown";
import ListingForm from "./ListingForm";
import RoleSwitchModal from "./SwitchRoleModal";

const App = () => {
  const { isAuthenticated, user, isLoading, logout } = useAuth0();
  const [modal, setModal] = useState("");
  //Custom query for getting hotels within a particular range
  const dateQuery = (value) => {
    let query = null;
    if (value) {
      query = [
        {
          range: {
            date_from: {
              gte: moment(value.start).format("YYYYMMDD"),
            },
          },
        },
        {
          range: {
            date_to: {
              lte: moment(value.end).format("YYYYMMDD"),
            },
          },
        },
      ];
    }
    return query ? { query: { bool: { must: query } } } : null;
  };
  //Show a popover when we click on a map pin
  const onPopoverClick = (data) => {
    return (
      <div className="popover">
        <div className="image-container">
          <img src={data.image} alt={data.name} height="185" width="263" />
        </div>
        <div className="extra-info-container">
          <div className="type-container info">
            {data.room_type}-{data.beds} bed
          </div>
          <div className="name-container info">{data.name}</div>
          <div className="price-container info">
            ${data.price} per night-Free cancellation
          </div>
        </div>
      </div>
    );
  };
  return isLoading ? (
    "Loading"
  ) : (
    <div className="main-container">
      {modal === "listing-form" ? (
        <ListingForm onClose={() => setModal("")} />
      ) : null}
      {modal === "role-switch" ? (
        <RoleSwitchModal
          onClose={() => setModal("")}
          onSave={(role) => {
            setModal("");
          }}
        />
      ) : null}
      <ReactiveBase
        app="clone-airbeds"
        url="https://73afb5484d0e:26bd5cb0-1afc-4e19-8870-4a2eda8d0b56@appbase-demo-ansible-abxiydt-arc.searchbase.io"
        mapKey="AIzaSyCqWUHFYNXCMlt13StFZzim5y06Yr99vRY"
        enableAppbase
        theme={{
          colors: {
            primaryColor: "#41ABF5",
          },
        }}
      >
        <div className="nav-container">
          <nav className="nav">
            <div className="title">Airbeds</div>
            {isAuthenticated ? (
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

        <div className="filters-search-container">
          <div className="filter-container">
            <div className="dropdown">
              <button className="btn">Price</button>
              <div className="dropdown-content">
                {/* Price filter for hotels within range*/}
                <RangeInput
                  componentId="PriceSensor"
                  dataField="price"
                  title="Price Range"
                  range={{
                    start: 10,
                    end: 250,
                  }}
                  rangeLabels={{
                    start: "$10",
                    end: "$250",
                  }}
                  defaultValue={{
                    start: 10,
                    end: 50,
                  }}
                  stepValue={10}
                  interval={20}
                  react={{
                    and: ["DateRangeSensor", "GuestSensor"],
                  }}
                  showHistogram={false}
                  className="rangeFilter"
                />
              </div>
            </div>
            <div className="dropdown">
              <button className="btn">Guests</button>
              <div className="dropdown-content-guest">
                {/* Filter for minimum no. of guests accomodated */}
                <NumberBox
                  componentId="GuestSensor"
                  dataField="accommodates"
                  title="Guests"
                  defaultValue={2}
                  labelPosition="right"
                  data={{
                    start: 1,
                    end: 16,
                  }}
                  className="numberFilter"
                />
              </div>
            </div>

            <div className="dropdown">
              <button className="btn ">When</button>
              <div className="dropdown-content">
                {/* Date filter for hotels that are available within the range */}
                <DateRange
                  dataField={["date_from", "date_to"]}
                  componentId="DateRangeSensor"
                  title="When"
                  numberOfMonths={2}
                  initialMonth={new Date("2017-04-11")}
                  customQuery={dateQuery}
                  className="dateFilter"
                  defaultValue={{
                    start: new Date("2017-04-11"),
                    end: new Date("2017-04-11"),
                  }}
                />
              </div>
            </div>
          </div>
          <div className="search-container">
            {/* Search hotels by name */}
            <SearchBox
              componentId="search"
              dataField="name"
              autosuggest={false}
              placeholder="Search housings..."
              iconPosition="left"
              className="search"
            />
          </div>
          <div className="selected-container">
            <SelectedFilters />
          </div>
        </div>
        <div className="result-map-container">
          {/* Show a google map locating hotels */}
          <ReactiveGoogleMap
            componentId="map"
            dataField="location"
            defaultZoom={13}
            pagination
            onPopoverClick={onPopoverClick}
            onPageChange={() => {
              window.scrollTo(0, 0);
            }}
            libraries={["places"]}
            style={{
              width: "100%",
              height: "100%",
            }}
            className="rightCol"
            showMarkerClusters={false}
            showSearchAsMove
            innerClass={{
              label: "label",
            }}
            render={({
              data: hits,
              renderMap,
              renderPagination,
              resultStats,
            }) => (
              <div>
                <div className="total-results">
                  Found {resultStats.numberOfResults} results in{" "}
                  {resultStats.time}ms
                </div>
                <div className="card-map-container">
                  <div>
                    <div className="card-container">
                      {hits.map((data) => (
                        <div key={data._id} className="card">
                          <div
                            className="card__image"
                            style={{ backgroundImage: `url(${data.image})` }}
                            alt={data.name}
                          />
                          <div>
                            <h2>{data.name}</h2>
                            <div className="card__price">${data.price}</div>
                            <p className="card__info">
                              {data.room_type} · {data.accommodates} guests
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div>{renderPagination()}</div>
                  </div>
                  <div className="map-container">{renderMap()}</div>
                </div>
              </div>
            )}
            renderItem={(data) => ({
              label: (
                <div
                  className="marker"
                  style={{
                    width: 40,
                    display: "block",
                    textAlign: "center",
                  }}
                >
                  <div className="extra-info">{data.name}</div>${data.price}
                </div>
              ),
            })}
            react={{
              and: ["GuestSensor", "PriceSensor", "DateRangeSensor", "search"],
            }}
          />
        </div>
      </ReactiveBase>
    </div>
  );
};

const container = document.getElementById("root");
const root = createRoot(container);
root.render(
  <Auth0Provider
    domain="dev-3l5njdlu.us.auth0.com"
    clientId="nCKDwUh12blYXCmJwcwH8oy7ZTgHw7LN"
    redirectUri={window.location.origin}
  >
    <App />
  </Auth0Provider>
);
