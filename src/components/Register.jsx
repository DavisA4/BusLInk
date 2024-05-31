import React from "react"; // Importējam nepieciešamo bibliotēku React
import { Form, Input, Modal, message } from "antd"; // Importējam nepieciešamās komponentes no Ant Design
import { LockOutlined, MailOutlined, UserOutlined } from "@ant-design/icons"; // Importējam nepieciešamos ikonus no Ant Design

export const Register = ({ visible, setVisible, defaultRole, onAddSuccess }) => { // Izveidojam funkcijas komponenti Register ar nepieciešamajiem parametriem
  const [form] = Form.useForm(); // Izveidojam formu, izmantojot Form.useForm() metodi

  const onFinish = async (values) => { // Funkcija, kas tiek izsaukta, kad tiek nosūtīti reģistrācijas dati
    try {
      const dataToSend = { // Sagatavojam datus, ko nosūtīt serverim
        ...values,
        role: defaultRole, // Papildinām datus ar noklusējuma lomu
      };

      const response = await fetch("http://localhost:8000/api/users/add-user", { // Veicam POST pieprasījumu, lai pievienotu lietotāju
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataToSend), // Pārvēršam datus par JSON formātu un nosūtam
      });
      const data = await response.json();
      if (response.ok) { // Ja pieprasījums bija veiksmīgs
        message.success(`${defaultRole} veiksmīgi pievienots!`); // Parādam veiksmes paziņojumu
        onAddSuccess(); // Izsaucam funkciju, kas atjauno lietotāju sarakstu
        handleCancel(); // Aizveram modālo logu
      } else {
        console.error(data.message); // Ja neizdevās pievienot lietotāju, izvadam kļūdas ziņojumu konsolē
      }
    } catch (error) {
      console.error("Error during registration:", error); // Ja ir kļūda, izvadam to konsolē
    }
  };

  const handleCancel = () => { // Funkcija, kas tiek izsaukta, kad tiek atcelta reģistrācija
    setVisible(false); // Paslēpjam modālo logu
    form.resetFields(); // Notīram formu
  };

  return (
    <Modal // Atgriežam modālo logu
      visible={visible} // Redzamības statuss
      title={defaultRole} // Modālā loga virsraksts
      onCancel={handleCancel} // Funkcija, kas tiek izsaukta, kad tiek aizvērts logs
      onOk={() => form.submit()} // Funkcija, kas tiek izsaukta, kad tiek noklikšķināta "Pievienot" poga
      okText="Pievienot" // Teksts uz "Pievienot" pogas
      cancelText="Atcelt" // Teksts uz "Atcelt" pogas
      maskClosable={false} // Modālais logs nevar tikt aizvērts, nospiežot fonu
    >
      <h1>Lietotāju reģistrācija</h1> 
      <Form // Reģistrācijas forma
        form={form}
        name="basic"
        onFinish={onFinish} // Kad forma tiek iesniegta, tiek izsaukta funkcija onFinish
        wrapperCol={{
          span: 16,
        }}
        style={{
          width: 600,
        }}
        autoComplete="off" // Izslēdzam automātisko aizpildīšanu pārlūkprogrammai
      >
        <Form.Item // E-pasta ievades lauks
          name="email"
          rules={[
            {
              required: true,
              message: "Lūdzu, ievadiet e-pastu!", // Kļūdas ziņojums, ja lauks ir tukšs
            },
          ]}
          wrapperCol={{ span: 19 }}
        >
          <Input prefix={<MailOutlined />} placeholder="E-pasts" /> 
        </Form.Item>

        <Form.Item // Paroles ievades lauks
          name="password"
          rules={[
            {
              required: true,
              message: "Lūdzu, ievadiet paroli!", // Kļūdas ziņojums, ja lauks ir tukšs
            },
          ]}
          wrapperCol={{ span: 19 }}
        >
         <Input prefix={<UserOutlined />} placeholder="Uzvārds" /> 
        </Form.Item>
      </Form>
    </Modal>
  );
};

