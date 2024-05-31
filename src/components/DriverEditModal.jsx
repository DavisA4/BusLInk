import React, { useState, useEffect } from "react"; // Importējam nepieciešamās bibliotēkas un komponentes no React
import { Modal, Form, Input, Button, Select, message } from "antd"; // Importējam nepieciešamās komponentes no Ant Design

const { Option } = Select; // Izgūstam Select komponentes Option komponenti no Ant Design

const DriverEditModal = ({ visible, setVisible, rowData, onUpdateSuccess }) => { // Definējam funkcijas komponenti DriverEditModal
  const [form] = Form.useForm(); // Izveidojam formu, izmantojot Form.useForm() metodi

  useEffect(() => { // Izmantojam useEffect, lai inicializētu formu ar sākotnējiem datiem
    if (visible && rowData) {
      form.setFieldsValue(rowData); // Iestatām formu ar sākotnējiem datiem, ja rediģēšanas logs ir redzams un ir nodoti sākotnējie dati
    }
  }, [visible, rowData, form]); // Atjaunojam efektu, kad mainās rediģēšanas logs, sākotnējie dati vai forma

  const handleUpdate = async (values) => { // Funkcija, kas tiek izsaukta, kad tiek veikta datu atjaunināšana
    try {
      const response = await fetch(
        `http://localhost:8000/api/drivers/edit-driver/${rowData._id}`, // Veicam PUT pieprasījumu, lai atjauninātu vadītāju datus
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(values), // Iesūtam atjauninātos datus
          credentials: "include",
        }
      );

      const data = await response.json();
      if (response.ok) { // Ja pieprasījums bija veiksmīgs
        console.log(data.message); // Izvadam veiksmes ziņojumu konsolē
        onUpdateSuccess(); // Izsaucam funkciju, kas atjauno vadītāju sarakstu
        message.success("Lietotājs veiksmīgi rediģēts!"); // Parādam veiksmes paziņojumu
        setVisible(false); // Paslēpjam rediģēšanas logu
      } else {
        console.error(data.message); // Ja neizdevās atjaunot datus, izvadam kļūdas ziņojumu konsolē
      }
    } catch (error) {
      console.error("Error updating user:", error); // Ja ir kļūda, izvadam to konsolē
    }
  };

  const handleCancel = () => { // Funkcija, kas tiek izsaukta, kad tiek atcelta rediģēšana
    setVisible(false); // Paslēpjam rediģēšanas logu
    form.resetFields(); // Notīram formu
  };

  return (
    <Modal // Atgriežam modālo logu
      visible={visible} // Redzamības statuss
      maskClosable={false} // Logu nevar aizvērt, nospiežot fonu
      onCancel={handleCancel} // Funkcija, kas tiek izsaukta, kad tiek aizvērts logs
      footer={[ // Pogas apakšā
        <Button key="cancel" onClick={handleCancel}> 
          Cancel
        </Button>,
        <Button key="update" type="primary" onClick={() => form.submit()}> 
          Update
        </Button>,
      ]}
    >
      <h1>Pārvadātāju rediģēšana</h1> 
      <Form form={form} onFinish={handleUpdate}> 
        <Form.Item
          name="company"
          label="Nosaukums"
          rules={[{ required: true }]} // Noteikumi, kas nosaka, ka lauks ir obligāts
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 24 }}
        >
          <Input /> 
        </Form.Item>
        <Form.Item
          name="email"
          label="E-pasts"
          rules={[{ required: true }]}
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 24 }}
        >
          <Input /> 
        </Form.Item>
        <Form.Item
          name="seatCount"
          label="Sēdvietu skaits"
          rules={[{ required: true }]}
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 24 }}
        >
          <Input type="number" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default DriverEditModal; // Eksportējam funkcijas komponenti
