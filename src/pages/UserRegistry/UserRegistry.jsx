import React, { useState, useEffect } from "react";
import Navbar from "../../components/Navbar/Navbar";
import { Layout, Button, Popconfirm, Space, message } from "antd";
import RestrictedPage from "../../components/RestrictedPage";
import { AgGridReact } from "ag-grid-react";
import { Register } from "../../components/Register";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-material.css";
import EditModal from "../../components/EditModal";
import {
  EditOutlined,
  DeleteOutlined,
  StopOutlined,
  CheckOutlined,
} from "@ant-design/icons";

import "./UserRegistry.css";

const { Content } = Layout;

const UserRegistry = () => {
  const [rowData, setRowData] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedRole, setSelectedRole] = useState("regular");
  const [selectedRow, setSelectedRow] = useState(null);

  const handleOpenModal = (role) => {
    setModalVisible(true);
    setSelectedRole(role);
    console.log(selectedRole);
  };

  const handleEdit = (rowData) => {
    setSelectedRow(rowData);
    setEditModalVisible(true);
    console.log(rowData);
  };

  const handleDelete = async (userId) => {
    try {
      const response = await fetch(
        `http://localhost:8000/api/users/delete-user/${userId}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );
      const data = await response.json();
      if (response.ok) {
        message.success(data.message);
        fetchUsersData();
      } else {
        message.error(data.message);
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      message.error("Failed to delete user");
    }
  };

  const handleToggleStatus = async (userId) => {
    try {
      const response = await fetch(
        `http://localhost:8000/api/users/toggle-user-status/${userId}`,
        {
          method: "PUT",
          credentials: "include",
        }
      );
      const data = await response.json();
      if (response.ok) {
        message.success(data.message);
        fetchUsersData();
      } else {
        message.error(data.message);
      }
    } catch (error) {
      console.error("Error toggling user status:", error);
      message.error("Failed to toggle user status");
    }
  };

  useEffect(() => {
    fetchUsersData();
  }, []);

  const fetchUsersData = async () => {
    try {
      const response = await fetch("http://localhost:8000/api/users/users", {
        credentials: "include",
      });
      const data = await response.json();
      setRowData(data);
    } catch (error) {
      console.error("Error fetching users data:", error);
    }
  };

  const columnDefs = [
    { headerName: "ID", field: "_id", flex: 1 },
    { headerName: "E-pasts", field: "email", flex: 1 },
    { headerName: "Vārds", field: "firstname", flex: 1 },
    { headerName: "Uzvārds", field: "lastname", flex: 1 },
    { headerName: "Loma", field: "role", flex: 1 },
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
              icon={
                params.data.status === "Aktīvs" ? (
                  <StopOutlined style={{ color: "red" }} />
                ) : (
                  <CheckOutlined style={{ color: "green" }} />
                )
              }
              onClick={() => handleToggleStatus(params.data._id)}
            />
          </Space>
        );
      },
    },
  ];

  return (
    <RestrictedPage allowedRoles={"Menedžeris"}>
      <Layout>
        <Navbar />
        <Layout>
          <Content>
            <div className="button-container">
              <Button.Group className="button-group">
                <Button
                  type="primary"
                  onClick={() => handleOpenModal("Pasažieris")}
                  className="add-button"
                >
                  Pievienot pasažieri
                </Button>
                <Button
                  className="add-button"
                  type="primary"
                  onClick={() => handleOpenModal("Menedžeris")}
                >
                  Pievienot menedžeri
                </Button>
              </Button.Group>
            </div>
            <Register
              visible={modalVisible}
              setVisible={setModalVisible}
              defaultRole={selectedRole}
              onAddSuccess={fetchUsersData}
            />
            <EditModal
              visible={editModalVisible}
              setVisible={setEditModalVisible}
              rowData={selectedRow}
              onUpdateSuccess={fetchUsersData}
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

export default UserRegistry;
