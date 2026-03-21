import { Routes, Route } from "react-router-dom";

import Layout from "./components/layout";
import Home from "./pages/home";
import Labs from "./pages/labs";
import Zones from "./pages/zones";
import LabManagement from "./pages/lab-management";
import TestCatalog from "./pages/test-catalog";

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/labs" element={<Labs />} />
        <Route path="/lab-management" element={<LabManagement />} />
        <Route path="/test-catalog" element={<TestCatalog />} />
        <Route path="/zones" element={<Zones />} />
      </Routes>
    </Layout>
  );
}

export default App;
