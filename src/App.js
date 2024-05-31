import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Login } from "./pages/Login/Login";
import Settings from "./pages/Settings/Settings";
import { UserProvider } from "./UserContext";
import "./App.css";
import UserRegistry from "./pages/UserRegistry/UserRegistry";
import DriverRegistry from "./pages/DriverRegistry/DriverRegistry";
import RouteRegistry from "./pages/RouteRegistry/RouteRegistry";

function App() {
  return (
    <div className="App">
      <UserProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/userregistry" element={<UserRegistry />} />
            <Route path="/driverregistry" element={<DriverRegistry />} />
            <Route path="/routeregistry" element={<RouteRegistry />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </Router>
      </UserProvider>
    </div>
  );
}

export default App;
