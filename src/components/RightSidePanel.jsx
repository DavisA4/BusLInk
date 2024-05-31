import React, { useState, useContext, useEffect } from "react";
import {
  Drawer,
  Timeline,
  Select,
  message,
  Collapse,
  Button,
  Table,
} from "antd";
import { UserContext } from "../UserContext";
import moment from "moment";

import "./RightSidePanel.css";

const { Option } = Select;
const { Panel } = Collapse;

const RightSidePanel = ({ visible, onClose, route }) => {
  const [selectedFrom, setSelectedFrom] = useState(null);
  const [selectedTo, setSelectedTo] = useState(null);
  const { firstname, lastname, role, id } = useContext(UserContext);

  const hasReservation =
    route &&
    route.reservations.some((reservation) => reservation.user._id === id);

  const isReservationCancelled =
    route &&
    route.reservations.some(
      (reservation) =>
        reservation.user._id === id && reservation.status_user === "Atcelts"
    );

  useEffect(() => {
    if (route && route.reservations) {
      const userReservation = route.reservations.find(
        (reservation) => reservation.user._id === id
      );

      const userSelectedFrom = userReservation
        ? userReservation.from_to[0]
        : null;
      const userSelectedTo = userReservation
        ? userReservation.from_to[1]
        : null;

      setSelectedFrom(userSelectedFrom);
      setSelectedTo(userSelectedTo);
    }
  }, [route, id]);

  const handleFromChange = (value) => {
    setSelectedFrom(value);
    setSelectedTo(null);
  };

  const handleToChange = (value) => {
    const fromIndex = route.busStops.findIndex(
      (stop) => stop.name === selectedFrom
    );
    const toIndex = route.busStops.findIndex((stop) => stop.name === value);

    if (toIndex <= fromIndex) {
      message.error("The 'to' bus stop must be after the 'from' bus stop.");
      setSelectedTo(null);
    } else if (selectedFrom === value) {
      message.error(
        "The 'to' bus stop cannot be the same as the 'from' bus stop."
      );
      setSelectedTo(null);
    } else {
      setSelectedTo(value);
    }
  };

  const handleCancelReservation = () => {
    const userReservation = route.reservations.find(
      (reservation) => reservation.user._id === id
    );

    if (userReservation) {
      fetch("http://localhost:8000/api/routes/cancel-reservation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ reservationId: userReservation._id }),
      })
        .then((response) => {
          if (response.ok) {
            message.success("Reservation cancelled successfully");
            // onReservationChange(); // Refetch routes or update state
          } else {
            throw new Error("Failed to cancel reservation");
          }
        })
        .catch((error) => {
          console.error("Error cancelling reservation:", error);
          message.error("Failed to cancel reservation");
        });
    }
  };

  const handlePieteikties = () => {
    if (selectedFrom && selectedTo) {
      const data = {
        routeId: route._id,
        firstname: firstname,
        lastname: lastname,
        from_to: [selectedFrom, selectedTo],
      };

      fetch("http://localhost:8000/api/routes/apply-route", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(data),
      })
        .then((response) => {
          if (response.ok) {
            message.success("Pieteikties successful");
          } else {
            throw new Error("Failed to pieteikties");
          }
        })
        .catch((error) => {
          console.error("Error pieteikties:", error);
          message.error("Failed to pieteikties");
        });
    } else {
      message.error("Please select 'No' and 'Uz' bus stops first.");
    }
  };

  const columns = [
    {
      title: "Vārds",
      dataIndex: "firstname",
      key: "firstname",
    },
    {
      title: "Uzvārds",
      dataIndex: "lastname",
      key: "lastname",
    },
    {
      title: "No-Līdz",
      dataIndex: "from_to",
      key: "from_to",
      render: (fromTo) => fromTo.join(" - "),
    },
  ];

  const timelineItems = route
    ? route.busStops.map((stop, index) => ({
        label: stop.time,
        children: (
          <div
            className={`timeline-item-content ${
              selectedFrom === stop.name || selectedTo === stop.name
                ? "selected"
                : ""
            }`}
          >
            {stop.name}
            <br />
            {stop.about}
          </div>
        ),
        className:
          selectedFrom === stop.name || selectedTo === stop.name
            ? "selected-timeline-item"
            : "",
      }))
    : [];

  const filteredFromBusStops = route ? route.busStops.slice(0, -1) : [];

  const filteredToBusStops = route
    ? route.busStops.filter((stop, index) => {
        if (selectedFrom) {
          const fromIndex = route.busStops.findIndex(
            (s) => s.name === selectedFrom
          );
          return index > fromIndex;
        }
        return true;
      })
    : [];

  const panelHeader = route ? (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <div>
        {route.busStops[0].time}
        <br />
        {route.busStops[0].name}
      </div>
      -
      <div>
        {route.busStops[route.busStops.length - 1].time}
        <br />
        {route.busStops[route.busStops.length - 1].name}
      </div>
      <div style={{ textAlign: "right" }}>
        {route.name} - {moment(route.date).format("YYYY-MM-DD")}
        <br />
        {route.status_user}
      </div>
    </div>
  ) : (
    <p>Izvēlietis reisu, lai redzētu informāciju</p>
  );

  return (
    <Drawer
      title={`Reiss: ${route ? route.name : ""}`}
      placement="right"
      onClose={onClose}
      open={visible}
      className="drawer-content"
      width={400}
    >
      <Collapse accordion>
        <Panel header={panelHeader} key="1">
          {route ? (
            <>
              {role !== "Menedžeris" && !hasReservation && (
                <>
                  <label>No</label>
                  <Select
                    placeholder="No"
                    style={{ width: "100%", marginBottom: "10px" }}
                    onChange={handleFromChange}
                    value={selectedFrom}
                  >
                    {filteredFromBusStops.map((stop) => (
                      <Option key={stop.name} value={stop.name}>
                        {stop.name}
                      </Option>
                    ))}
                  </Select>
                  <label>Uz</label>
                  <Select
                    placeholder="Uz"
                    style={{ width: "100%", marginBottom: "20px" }}
                    onChange={handleToChange}
                    value={selectedTo}
                    disabled={!selectedFrom}
                  >
                    {filteredToBusStops.map((stop) => (
                      <Option key={stop.name} value={stop.name}>
                        {stop.name}
                      </Option>
                    ))}
                  </Select>
                </>
              )}
              <Timeline mode="left" items={timelineItems} />
              {role === "Menedžeris" && (
                <div className="reservations-section">
                  <h3>Pieteikumi</h3>
                  <Table
                    columns={columns}
                    dataSource={route.reservations}
                    pagination={false}
                  />
                </div>
              )}
              {role !== "Menedžeris" &&
                hasReservation &&
                !isReservationCancelled && (
                  <div className="button-right-align">
                    <Button type="default" onClick={handleCancelReservation}>
                      Atcelt rezervāciju
                    </Button>
                  </div>
                )}
              {role !== "Menedžeris" && !hasReservation && (
                <div className="button-right-align">
                  <Button type="primary" onClick={handlePieteikties}>
                    Pieteikties
                  </Button>
                </div>
              )}
            </>
          ) : (
            <p>Izvēlieties reisu, lai redzētu informāciju</p>
          )}
        </Panel>
      </Collapse>
    </Drawer>
  );
};

export default RightSidePanel;
