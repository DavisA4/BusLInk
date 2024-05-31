import React, { useContext } from "react"; // Importē React un useContext haku no React bibliotēkas
import { useNavigate, useLocation } from "react-router-dom"; // Importē useNavigate un useLocation hakus no react-router-dom bibliotēkas
import { Layout, Menu, Divider, message } from "antd"; // Importē Layout, Menu, Divider, un message komponentes no antd bibliotēkas
import { UserContext } from "../../UserContext"; // Importē UserContext no UserContext faila
import Clock from "../Clock"; // Importē Clock komponenti no Clock faila
import {
  CalendarOutlined,
  ProfileOutlined,
  FileOutlined,
  TeamOutlined,
  SettingOutlined,
  LogoutOutlined,
} from "@ant-design/icons"; // Importē dažādus ikonus no ant-design bibliotēkas
import "./Navbar.css"; // Importē Navbar stila failu

const { Sider } = Layout; // Destrukturizē Layout komponenti, lai izņemtu Sider no tās

const Navbar = () => { // Funkcionālais komponents Navbar
  const navigate = useNavigate(); // Definē navigate funkciju, izmantojot useNavigate haku
  const { handleLogout, role } = useContext(UserContext); // Izgūst handleLogout un role no UserContext, izmantojot useContext haku
  const location = useLocation(); // Definē location, izmantojot useLocation haku

  const handleLogoutClick = async () => { // Funkcija, lai apstrādātu iziešanas klikšķi
    try {
      await fetch("http://localhost:8000/api/users/logout", { // Nosūta POST pieprasījumu uz iziešanas galapunktu
        method: "POST", // Izmanto POST metodi
        credentials: "include", // Iekļauj atļaujas
      });
      handleLogout(); // Izsauc handleLogout funkciju
      navigate("/login"); // Navigē uz ienākšanas lapu
      console.log("Iziet veiksmīgi"); // Izvada veiksmīgas iziešanas ziņojumu
    } catch (error) { // Uztver kļūdas, kas rodas iziešanas procesā
      console.error("Kļūda iziešanas laikā:", error); // Izvada kļūdas ziņojumu
    }
  };

  const items = [ // Masīvs ar izvēlnes vienībām
    { label: "Kalendārds", icon: <CalendarOutlined />, link: "/", key: "1" }, // Kalendāra izvēlnes vienība
    {
      label: "Reisu saraksts",
      icon: <ProfileOutlined />,
      link: "/routeregistry",
      key: "2",
    }, // Maršrutu reģistra izvēlnes vienība
    ...(role === "Menedžeris" // Pievieno izvēlnes vienības, pamatojoties uz lietotāja lomu
      ? [
          {
            label: "Reisu šabloni",
            icon: <FileOutlined />,
            link: "/reisusab",
            key: "3",
          }, // Maršruta veidņu izvēlnes vienība
          {
            label: "Lietotāju reģistrs",
            icon: <TeamOutlined />,
            link: "/userregistry",
            key: "4",
          }, // Lietotāju reģistra izvēlnes vienība
          {
            label: "Pārvadātāju reģistrs",
            icon: <TeamOutlined />,
            link: "/driverregistry",
            key: "5",
          }, // Pārvadātāju reģistra izvēlnes vienība
          {
            label: "Iestatījumi",
            icon: <SettingOutlined />,
            link: "/settings",
            key: "6",
          }, // Iestatījumu izvēlnes vienība
        ]
      : []), // Tukšs masīvs, ja lietotāja loma nav "Menedžeris"
    {
      label: "Izlogoties",
      icon: <LogoutOutlined />,
      key: "7",
      onClick: handleLogoutClick,
    }, // Iziet izvēlnes vienība ar onClick notikumu apstrādātāju
  ];

  return ( // Atgriež JSX
    <Sider
      breakpoint="lg"
      collapsedWidth="0"
      theme="light"
      width={270}
      className="navbar-sider"
    > {/* Sānjoslas komponents */}
      <h1 className="navbar-header">Bus Link</h1> {/* Navigācijas galvenes virsraksts */}
      <Clock /> {/* Pulksteņa komponents */}
      <Divider className="navbar-divider" /> {/* Atdalītājs */}
      <Menu
        className="navbar-menu"
        selectedKeys={[location.pathname]}
        mode="inline"
      > {/* Izvēlnes komponents */}
        {items.map((item) => ( // Kartē cauri izvēlnes vienībām
          <Menu.Item
            key={item.link || item.label}
            icon={item.icon}
            onClick={item.onClick || (() => navigate(item.link))}
          > {/* Izvēlnes vienība */}
            {item.label}
          </Menu.Item>
        ))}
      </Menu>
    </Sider>
  );
};

export default Navbar; // Eksportē Navbar komponentu
