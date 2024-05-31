import React, { useState, useEffect, useContext } from "react";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-material.css";
import Navbar from "../../components/Navbar/Navbar";
import { Layout, Button, Modal, Form, message } from "antd";
import AddRouteForm from "../../components/AddRouteForm";
import RightSidePanel from "../../components/RightSidePanel";
import { EditOutlined } from "@ant-design/icons";
import RouteEditModal from "../../components/RouteEditModal";
import { UserContext } from "../../UserContext";

const { Content } = Layout;

const RouteRegistry = () => {
  const [form] = Form.useForm();
  const [rowData, setRowData] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [drivers, setDrivers] = useState([]);
  const { id, role } = useContext(UserContext);

  const fetchRoutes = async () => {
    try {
      const response = await fetch("http://localhost:8000/api/routes/routes");
      const data = await response.json();
      setRowData(data);
      console.log(rowData);
    } catch (error) {
      console.error("Error fetching routes:", error);
      message.error("Failed to fetch routes");
    }
  };

  const fetchDrivers = async () => {
    try {
      const response = await fetch("http://localhost:8000/api/drivers/drivers");
      const data = await response.json();
      setDrivers(data);
    } catch (error) {
      console.error("Error fetching drivers:", error);
      message.error("Failed to fetch drivers");
    }
  };

  useEffect(() => {
    fetchRoutes();
    fetchDrivers();
  }, []);

  const columns = [
    { headerName: "Nosaukums", field: "name" },
    {
      headerName: "Datums",
      field: "date",
      valueFormatter: (params) => {
        const formattedDate = new Date(params.value).toLocaleDateString();
        const firstBusStopTime = params.data.busStops[0]?.time;
        const lastBusStopTime =
          params.data.busStops[params.data.busStops.length - 1]?.time;
        return `${formattedDate} ${firstBusStopTime} - ${lastBusStopTime}`;
      },
    },
    { headerName: "Pārvadātājs", field: "driver.company" },
  ];

  if (role !== "Menedžeris") {
    columns.push({
      headerName: "Statuss",
      field: "status_user",
      valueGetter: (params) => {
        const userId = id;
        const routeReservations = params.data.reservations || [];

        // Check if there is a reservation for the current user
        const userReservation = routeReservations.find(
          (reservation) => reservation.user._id === userId
        );

        // If a reservation exists for the user, use its status; otherwise, use the global route status
        return userReservation
          ? userReservation.status_user
          : params.data.status_user;
      },
    });
  }

  if (role === "Menedžeris") {
    columns.push(
      {
        headerName: "Sēdvietu skaits",
        field: "seatCount",
        valueGetter: (params) => {
          const seatCount = params.data.seatCount;
          const seatsTaken = params.data.reservations
            ? params.data.reservations.length
            : 0;
          return `${seatsTaken}/${seatCount}`;
        },
      },
      {
        headerName: "Izveidots",
        field: "created_at",
        valueFormatter: (params) => new Date(params.value).toLocaleString(),
      },
      {
        headerName: "Statuss",
        field: "status_admin",
      },
      {
        headerName: "",
        field: "edit",
        cellRenderer: (params) => (
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEdit(params.data)}
            className="edit-button"
          />
        ),
      }
    );
  }

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleEdit = (rowData) => {
    setSelectedRoute(rowData);
    setIsEditModalVisible(true);
  };

  const handleCancel = () => {
    form.resetFields();
    setIsModalVisible(false);
    setIsDrawerVisible(false);
  };

  const onRowClicked = (event) => {
    if (!isEditModalVisible) {
      setSelectedRoute(event.data);
      setIsDrawerVisible(true);
    }
  };

  const handleDrawerClose = () => {
    setIsDrawerVisible(false);
    setSelectedRoute(null);
  };

  return (
    <>
      <Layout>
        <Navbar />
        <Layout>
          <Content>
            <div className="button-container">
              <Button
                type="primary"
                onClick={showModal}
                className="add-button"
                style={{ margin: 10 }}
              >
                Pievienot reisu
              </Button>
            </div>
            <div
              className="ag-theme-material"
              style={{ height: "85vh", width: "100%" }}
            >
              <AgGridReact
                rowData={rowData}
                columnDefs={columns}
                pagination={true}
                paginationPageSize={10}
                defaultColDef={{ flex: 1, minWidth: 100, resizable: true }}
                onRowClicked={onRowClicked}
              />
            </div>
            <Modal
              title="Pievienot reisu"
              open={isModalVisible}
              onCancel={handleCancel}
              maskClosable={false}
              footer={null}
            >
              <AddRouteForm
                form={form}
                onClose={handleCancel}
                onAdd={fetchRoutes}
              />
            </Modal>
            {isEditModalVisible && (
              <RouteEditModal
                visible={isEditModalVisible}
                onClose={() => setIsEditModalVisible(false)}
                drivers={drivers}
                onUpdate={fetchRoutes}
                route={selectedRoute}
              />
            )}
            {!isEditModalVisible && (
              <RightSidePanel
                visible={isDrawerVisible}
                onClose={handleDrawerClose}
                route={selectedRoute}
              />
            )}
          </Content>
        </Layout>
      </Layout>
    </>
  );
};

export default RouteRegistry;
