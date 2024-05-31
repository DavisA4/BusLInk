import React, { useState, useEffect } from "react";
import { Form, Input, Button, message, Layout } from "antd";
import Navbar from "../../components/Navbar/Navbar";
import "./Settings.css";
const { Content } = Layout;

const Settings = () => {
  const [form] = Form.useForm();
  const [time, setTime] = useState("");

  useEffect(() => {
    fetchTimeFromDatabase();
  }, []);

  const fetchTimeFromDatabase = async () => {
    try {
      const response = await fetch(
        "http://localhost:8000/api/settings/get-time"
      );
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data) && data.length > 0) {
          setTime(data[0].time); 
          form.setFieldsValue({ time: data[0].time });
          console.log(data[0].time);
        } else {
          throw new Error("No time data found");
        }
      } else {
        throw new Error("Failed to fetch time from database");
      }
    } catch (error) {
      console.error("Error fetching time from database:", error);
      message.error("Failed to fetch time from database");
    }
  };

  const onFinish = async (values) => {
    try {
      const response = await fetch(
        "http://localhost:8000/api/settings/save-time",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(values),
        }
      );
      if (response.ok) {
        message.success("Time saved successfully");
      } else {
        throw new Error("Failed to save time");
      }
    } catch (error) {
      console.error("Error saving time:", error);
      message.error("Failed to save time");
    }
  };

  return (
    <>
      <Layout>
        <Navbar />
        <Layout>
          <Content>
            <div className="settings-container">
              <h1>Iestatījumi</h1>
              <Form form={form} name="timeForm" onFinish={onFinish}>
                <Form.Item
                  label="Laiks"
                  name="time"
                  rules={[
                    {
                      required: true,
                      message: "Lūdzu, ievadiet laiku!",
                    },
                  ]}
                >
                  <Input type="time" format="HH:mm" placeholder="Ievadiet laiku(HH:mm)" />
                </Form.Item>
                <Form.Item>
                  <Button type="primary" htmlType="submit">
                    Saglabāt
                  </Button>
                </Form.Item>
              </Form>
            </div>
          </Content>
        </Layout>
      </Layout>
    </>
  );
};

export default Settings;
