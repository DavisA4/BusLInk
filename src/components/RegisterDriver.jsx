import React from "react";
import { Form, Input, Modal, message, InputNumber } from "antd";
import { LockOutlined, MailOutlined, UserOutlined } from "@ant-design/icons";

export const RegisterDriver = ({ visible, setVisible, onAddSuccess }) => {
  const [form] = Form.useForm();

  const onFinish = async (values) => {
    try {
      // Izveido objektu, kas satur vērtības no formas un noklusēto lomu "Pārvadātājs"
      const dataToSend = {
        ...values,
        role: "Pārvadātājs",
      };

      // Izveido pieprasījumu, lai pievienotu pārvadātāju, izmantojot piegādāto API
      const response = await fetch(
        "http://localhost:8000/api/drivers/add-driver",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(dataToSend),
        }
      );
      const data = await response.json();
      if (response.ok) {
        // Parādi veiksmes ziņojumu, aizver modālo logu un izsauc funkciju "onAddSuccess"
        message.success("Pārvadātājs veiksmīgi pievienots!");
        handleCancel();
        onAddSuccess();
      } else {
        console.error(data.message);
      }
    } catch (error) {
      console.error("Error during registration:", error);
    }
  };

  // Aizver modālo logu un notīra formas laukus
  const handleCancel = () => {
    setVisible(false);
    form.resetFields();
  };

  return (
    <Modal
      visible={visible} // Pievieno "visible" modālajam logam, lai kontrolētu redzamību
      title="Pārvadātājs"
      onCancel={handleCancel} // Izsauc funkciju "handleCancel", kad tiek atcelts
      onOk={() => form.submit()} // Izsauc formas iesniegšanu, kad tiek noklikšķināts "OK"
      okText="Pievienot"
      cancelText="Atcelt"
      maskClosable={false}
    >
      <h1>Pārvadātāju reģistrācija</h1>
      {/* Forma, lai ievadītu jauna pārvadātāja informāciju */}
      <Form
        form={form}
        name="basic"
        onFinish={onFinish} // Izsauc funkciju "onFinish", kad forma tiek iesniegta
        wrapperCol={{
          span: 16,
        }}
        style={{
          width: 600,
        }}
        autoComplete="off"
      >
        <Form.Item
          name="company"
          rules={[
            {
              required: true,
              message: "Lūdzu, ievadiet nosaukumu!",
            },
          ]}
          wrapperCol={{ span: 19 }}
        >
          <Input prefix={<MailOutlined />} placeholder="Nosaukums" />
        </Form.Item>
        <Form.Item
          name="email"
          rules={[
            {
              required: true,
              message: "Lūdzu, ievadiet e-pastu!",
            },
          ]}
          wrapperCol={{ span: 19 }}
        >
          <Input prefix={<MailOutlined />} placeholder="E-pasts" />
        </Form.Item>

        <Form.Item
          name="password"
          rules={[
            {
              required: true,
              message: "Lūdzu, ievadiet paroli!",
            },
          ]}
          wrapperCol={{ span: 19 }}
        >
          <Input.Password prefix={<LockOutlined />} placeholder="Parole" />
        </Form.Item>

        <Form.Item
          name="seatCount"
          rules={[
            {
              required: true,
              message: "Lūdzu, ievadiet sēdvietu skaitu!",
            },
          ]}
          wrapperCol={{ span: 19 }}
        >
          <Input type="number" placeholder="Sēdvietu skaits" />
        </Form.Item>
      </Form>
    </Modal>
  );
};
