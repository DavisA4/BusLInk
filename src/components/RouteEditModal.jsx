import React from "react";
import {
  Modal,
  Form,
  Input,
  InputNumber,
  Button,
  DatePicker,
  Select,
  Space,
  message,
} from "antd";
import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";
import moment from "moment";

const { Option } = Select;

const RouteEditModal = ({ visible, onClose, route, drivers, onUpdate }) => {
  const [form] = Form.useForm();

  const handleFinish = async (values) => {
    const busStops = values.busStops;
    for (let i = 1; i < busStops.length; i++) {
      if (busStops[i].time.isBefore(busStops[i - 1].time)) {
        message.error(
          "Katras autobusa pieturas laikam jābūt vēlākam par iepriekšējās autobusa pieturas laiku."
        );
        return;
      }
    }
    try {
      const formattedValues = {
        ...values,
        date: values.date.format("YYYY-MM-DD"),
        busStops: values.busStops.map((busStop) => ({
          name: busStop.name,
          time: busStop.time.format("HH:mm"),
          about: busStop.about,
        })),
      };
      const response = await fetch(
        `http://localhost:8000/api/routes/update-route/${route._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formattedValues),
        }
      );

      if (response.ok) {
        onUpdate();
        onClose();
      } else {
        const responseData = await response.json();
        if (response.status === 403) {
          message.error(responseData.message);
        } else {
          throw new Error("Failed to update route");
        }
      }
    } catch (error) {
      console.error("Error updating route:", error);
      message.error("Failed to update route");
    }
  };

  const handleDriverChange = (value) => {
    const selectedDriver = drivers.find((driver) => driver._id === value);
    form.setFieldsValue({
      seat_count: selectedDriver ? selectedDriver.seatCount : "",
    });
  };

  const disabledDate = (current) => {
    return current && current < moment().startOf("day");
  };

  return (
    <Modal title="Edit Route" open={visible} onCancel={onClose} footer={null}>
      <Form
        form={form}
        onFinish={handleFinish}
        layout="vertical"
        initialValues={{
          ...route,
          driver: route.driver._id,
          seat_count: route.seatCount,
          date: route?.date ? moment(route.date) : null,
          busStops: route?.busStops?.map((busStop) => ({
            name: busStop.name || "",
            time: busStop.time ? moment(busStop.time, "HH:mm") : null,
            about: busStop.about || "",
          })) || [{ name: "", time: null }],
        }}
      >
        <Form.Item
          name="name"
          label="Reisa nosaukums"
          rules={[
            { required: true, message: "Lūdzu, ievediet reisa nosaukumu!" },
          ]}
        >
          <Input placeholder="Ievadiet reisa nosaukumu" />
        </Form.Item>
        <Form.Item
          name="date"
          label="Datums"
          rules={[{ required: true, message: "Lūdzu, izvēlieties datumu!" }]}
        >
          <DatePicker placeholder="Datums" disabledDate={disabledDate} />
        </Form.Item>
        <Form.Item
          name="driver"
          label="Pārvadātājs"
          rules={[{ required: true, message: "Lūdzu, ievadiet pārvadātāju!" }]}
        >
          <Select
            placeholder="Izvēlieties pārvadātāju"
            onChange={handleDriverChange}
          >
            {drivers.map((driver) => (
              <Option key={driver._id} value={driver._id}>
                {driver.company}
              </Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item
          name="seat_count"
          label="Sēdvietu skaits"
          rules={[
            { required: true, message: "Lūdzu, ievediet sēdvietu skaitu!" },
          ]}
        >
          <InputNumber placeholder="Ievadiet sēdvietu skaitu" min={1} />
        </Form.Item>
        <Form.List name="busStops">
          {(fields, { add, remove }) => (
            <>
              {fields.map((field, index) => (
                <Space key={field.key} align="baseline">
                  <Form.Item
                    {...field}
                    name={[field.name, "name"]}
                    fieldKey={[field.fieldKey, "name"]}
                    rules={[
                      {
                        required: true,
                        message: "Lūdzu, ievadiet pieturas nosaukumu!",
                      },
                    ]}
                  >
                    <Input placeholder="Pieturas nosaukums" />
                  </Form.Item>
                  <Form.Item
                    {...field}
                    name={[field.name, "time"]}
                    fieldKey={[field.fieldKey, "time"]}
                    rules={[
                      {
                        required: true,
                        message: "Lūdzu, ievadiet pieturas laiku!",
                      },
                    ]}
                  >
                    <DatePicker
                      picker="time"
                      format="HH:mm"
                      placeholder="Laiks"
                    />
                  </Form.Item>
                  <Form.Item
                    {...field}
                    name={[field.name, "about"]}
                    fieldKey={[field.fieldKey, "about"]}
                  >
                    <Input placeholder="Papildus informācija" />
                  </Form.Item>
                  {index >= 2 && (
                    <MinusCircleOutlined onClick={() => remove(field.name)} />
                  )}
                </Space>
              ))}
              <Form.Item>
                <Button
                  type="dashed"
                  onClick={() => add()}
                  block
                  icon={<PlusOutlined />}
                >
                  Pievienot pieturu
                </Button>
              </Form.Item>
            </>
          )}
        </Form.List>
        <Form.Item>
          <Button type="primary" htmlType="submit">
            Saglabāt izmaiņas
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default RouteEditModal;
