import React, { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Form, Input } from "antd";
import { LockOutlined, MailOutlined } from "@ant-design/icons";
import { UserContext } from "../../UserContext";

import "./login.css";

export const Login = () => {
  const navigate = useNavigate();
  const { handleLogin, currentUser, role } = useContext(UserContext);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const onFinish = async () => {
    try {
      const response = await fetch("http://localhost:8000/api/users/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
        credentials: "include",
      });
      const data = await response.json();
      if (response.ok) {
        document.cookie = `token=${data.token}; path=/; SameSite=Lax`;
        console.log(data)
        await handleLogin();
      } else {
        console.error(data.message);
      }
    } catch (error) {
      console.error("Error during login:", error);
    }
  };

  useEffect(() => {
    if (currentUser) {
      navigate("/routeregistry");
    }
  }, [currentUser]);

  return (
    <div className="wrapper">
      <div className="login-form">
        <h1>Ielogoties</h1>
        <Form
          name="basic"
          onFinish={onFinish}
          wrapperCol={{
            span: 16,
          }}
          style={{
            width: 600,
          }}
          initialValues={{
            remember: true,
          }}
          autoComplete="off"
        >
          <Form.Item
            value={email}
            rules={[
              {
                required: true,
                message: "Ievadiet jūsu e-pastu!",
              },
            ]}
          >
            <Input
              prefix={<MailOutlined />}
              name="email"
              placeholder="E-pasts"
              onChange={(e) => setEmail(e.target.value)}
            />
          </Form.Item>

          <Form.Item
            value={password}
            rules={[
              {
                required: true,
                message: "Ievadiet jūsu paroli!",
              },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              name="password"
              placeholder="Parole"
              onChange={(e) => setPassword(e.target.value)}
            />
          </Form.Item>

          <Form.Item
            className="login-submit"
            wrapperCol={{
              span: 3,
            }}
          >
            <Button className="login-btn" type="primary" htmlType="submit">
              Ielogoties
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};
