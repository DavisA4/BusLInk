import React, { useState, useEffect } from "react";
import Navbar from "../../components/Navbar/Navbar";
import { Layout, Button, Popconfirm, Space } from "antd";
import RestrictedPage from "../../components/RestrictedPage";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-material.css";
import { EditOutlined, DeleteOutlined, StopOutlined } from "@ant-design/icons";

import { RegisterDriver } from "../../components/RegisterDriver";
import DriverEditModal from "../../components/DriverEditModal";

import "./DriverRegistry.css";

const { Content } = Layout;

const DriverRegistry = () => {
  const [rowData, setRowData] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);

  const handleOpenModal = () => {
    setModalVisible(true);
  };

  const handleEdit = (rowData) => {
    setSelectedRow(rowData);
    setEditModalVisible(true);
  };

  const handleDelete = async (userId) => {
    try {
      const response = await fetch(
        `http://localhost:8000/api/drivers/delete-driver/${userId}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );
      const data = await response.json();
      if (response.ok) {
        console.log(data.message);
        fetchDriversData();
      } else {
        console.error(data.message);
      }
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  const handleDeactivate = async (userId) => {
    try {
      const response = await fetch(
        `http://localhost:8000/api/drivers/deactivate-driver/${userId}`,
        {
          method: "PUT",
          credentials: "include",
        }
      );
      const data = await response.json();
      if (response.ok) {
        console.log(data.message);
        fetchDriversData();
      } else {
        console.error(data.message);
      }
    } catch (error) {
      console.error("Error deactivating user:", error);
    }
  };

  useEffect(() => {
    fetchDriversData();
  }, []);

  const fetchDriversData = async () => {
    try {
      const response = await fetch("http://localhost:8000/api/drivers/drivers");
      const data = await response.json();
      setRowData(data);
    } catch (error) {
      console.error("Error fetching users data:", error);
    }
  };

  const columnDefs = [
    { headerName: "ID", field: "_id", flex: 1 },
    { headerName: "Nosaukums", field: "company", flex: 1 },
    { headerName: "E-pasts", field: "email", flex: 1 },
    { headerName: "Loma", field: "role", flex: 1 },
    { headerName: "Vietu skaits", field: "seatCount", flex: 1 },
    { headerName: "Statuss", field: "status", flex: 1 },
    {
      cellRenderer: (params) => {
        return (
          <Space size="small">
            <Button
              type="text"
              icon={<EditOutlined />}
                onClick={() => handleEdit(params.data)}
              className="edit-button"
            />
            <Popconfirm
              title="Vai esat pārliecināts, ka vēlaties dzēst šo lietotāju?"
              onConfirm={() => handleDelete(params.data._id)}
              okText="Jā"
              cancelText="Nē"
            >
              <Button type="text" danger icon={<DeleteOutlined />} />
            </Popconfirm>
            <Button
              type="text"
              danger
              icon={<StopOutlined />}
              onClick={() => handleDeactivate(params.data._id)}
            />
          </Space>
        );
      },
    },
  ];

  return (
    <RestrictedPage allowedRoles={["Menedžeris", "Pārvadātājs"]}>
      <Layout>
        <Navbar />
        <Layout>
          <Content>
            <div className="button-container">
              <Button
                type="primary"
                onClick={() => handleOpenModal()}
                className="add-button"
              >
                Pievienot pārvadātāju
              </Button>
            </div>
            <RegisterDriver
              visible={modalVisible}
              setVisible={setModalVisible}
              onAddSuccess={fetchDriversData}
            />
            <DriverEditModal
              visible={editModalVisible}
              setVisible={setEditModalVisible}
              rowData={selectedRow}
              onUpdateSuccess={fetchDriversData}
            />
            <div
              className="ag-theme-material"
              style={{ height: "95vh", width: "100%" }}
            >
              <AgGridReact
                rowData={rowData}
                columnDefs={columnDefs}
                pagination={true}
                paginationPageSize={10}
              />
            </div>
          </Content>
        </Layout>
      </Layout>
    </RestrictedPage>
  );
};

export default DriverRegistry;
