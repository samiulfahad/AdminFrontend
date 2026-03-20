import { Routes, Route } from "react-router-dom";

import Layout from "./components/layout";
import Home from "./pages/home";
import Labs from "./pages/labs";
import Zones from "./pages/zones";
import LabManagement from "./pages/lab-management";

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/labs" element={<Labs />} />
        <Route path="/zones" element={<Zones />} />
        <Route path="/lab-management" element={<LabManagement />} />
      </Routes>
    </Layout>
  );
}

export default App;
