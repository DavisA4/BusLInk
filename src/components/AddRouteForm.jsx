import React, { useState, useEffect } from "react"; // Importējam nepieciešamās bibliotēkas un komponentes no React un Ant Design
import { Form, Input, Button, DatePicker, Select, Space, message } from "antd";
import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";
import moment from "moment";

const { Option } = Select; // Izgūstam Select komponentes Option komponenti no Ant Design

const AddRouteForm = ({ form, onClose, onAdd }) => { // Definējam funkciju komponenti AddRouteForm, kura saņem trīs props - form, onClose, onAdd
  const [drivers, setDrivers] = useState([]); // Izveidojam stāvokli, kur saglabāsim vadītāju sarakstu

  useEffect(() => {
    fetchDrivers(); // Izmantojam useEffect, lai iegūtu vadītāju sarakstu, kad komponente tiek ielādēta
  }, []);

  const fetchDrivers = async () => { // Funkcija, kas asinhroni iegūst vadītāju sarakstu
    try {
      const response = await fetch("http://localhost:8000/api/drivers/drivers"); // Veicam GET pieprasījumu, lai iegūtu vadītāju sarakstu
      const data = await response.json(); // Pārveidojam atbildi par JSON
      setDrivers(data); // Iestatām vadītāju sarakstu
    } catch (error) {
      console.error("Error fetching drivers:", error); // Ja ir kļūda, izvadām to konsolē
      message.error("Failed to fetch drivers"); // Parādām paziņojumu par kļūdu
    }
  };

  const handleFinish = async (values) => { // Funkcija, kas tiek izsaukta, kad forma tiek iesniegta
    const busStops = values.busStops; // Izgūstam autobusa pieturu informāciju no formas
    for (let i = 1; i < busStops.length; i++) {
      if (busStops[i].time.isBefore(busStops[i - 1].time)) { // Pārbaudam, vai katras nākamās autobusa pieturas laiks ir pēc iepriekšējās
        message.error(
          "Katras autobusa pieturas laikam jābūt vēlākam par iepriekšējās autobusa pieturas laiku."
        );
        return;
      }
    }

    const formattedValues = { // Sagatavojam datus, lai tos nosūtītu serverim
      ...values,
      date: values.date.format("YYYY-MM-DD"), // Pārveidojam datumu pareizajā formātā
      busStops: values.busStops.map((busStop) => ({ // Pārveidojam autobusa pieturu laikus pareizajā formātā
        name: busStop.name,
        time: busStop.time.format("HH:mm"),
        about: busStop.about,
      })),
    };

    try {
      const response = await fetch(
        "http://localhost:8000/api/routes/add-route", // Veicam POST pieprasījumu, lai pievienotu maršrutu
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formattedValues),
        }
      );

      if (response.ok) { // Ja pieprasījums bija veiksmīgs
        onAdd(); // Izsaucam funkciju, kas atjauno maršrutu sarakstu
        message.success("Route added successfully"); // Parādam veiksmes paziņojumu
        form.resetFields(); // Notīram formu
        onClose(); // Aizveram formu
      } else {
        throw new Error("Failed to add route"); // Ja neizdevās pievienot maršrutu, izmetam kļūdu
      }
    } catch (error) {
      console.error("Error adding route:", error); // Ja ir kļūda, izvadam to konsolē
      message.error("Failed to add route"); // Parādam paziņojumu par kļūdu
    }
  

  };

  const handleDriverChange = (value) => { // Funkcija, kas tiek izsaukta, kad tiek mainīts vadītājs
    const selectedDriver = drivers.find((driver) => driver._id === value); // Atrodam izvēlēto vadītāju
    form.setFieldsValue({
      seat_count: selectedDriver ? selectedDriver.seatCount : "", // Iestatām sēdvietu skaitu atkarībā no izvēlētā vadītāja
    });
  };

  const disabledDate = (current) => { // Funkcija, kas nosaka, kuri datumi ir atspējoti
    return current && current < moment().startOf('day'); // Atspējo datumus, kas ir agrāk par pašreizējo datumu
  };

  return (
    <Form form={form} onFinish={handleFinish} layout="vertical"> 
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
        <DatePicker placeholder="Datums" disabledDate={disabledDate}/> 
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
          {drivers.map((driver) => ( // Izvēlnes opcijas, kas izmanto vadītāju sarakstu
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
        <Input placeholder="Ievadiet sēdvietu skaitu" /> 
      </Form.Item>
      <Form.List
        name="busStops"
        initialValue={[ // Sākotnējās vērtības autobusa pieturām
          { name: "", time: null, about: "" },
          { name: "", time: null, about: "" },
        ]}
      >
        {(fields, { add, remove }) => ( // Izvada laukus autobusa pieturām un atļauj pievienot vai noņemt pieturas
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
                {index >= 2 && ( // Izvada ikonu, ar kuru var noņemt autobusa pieturu
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
          Add Route
        </Button>
      </Form.Item>
    </Form>
  );
};

export default AddRouteForm; // Eksportējam funkcijas komponenti
