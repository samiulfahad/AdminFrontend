import { Routes, Route } from "react-router-dom";

import Layout from "./components/layout";
import Home from "./pages/home";
import Labs from "./pages/labs";
import LabManagement from "./pages/lab-management";
import TestCatalog from "./pages/test-catalog";
import SchemaEngine from "./pages/schemaEngine";
import SchemaBuilder from "./pages/schemaBuilder";
import Zones from "./pages/zones";
import ReportUpload from "./pages/reportUpload";
import ReportDownload from "./pages/reportDownload";
function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/labs" element={<Labs />} />
        <Route path="/lab-management" element={<LabManagement />} />
        <Route path="/test-catalog" element={<TestCatalog />} />
        <Route path="/schema-engine" element={<SchemaEngine />} />
        <Route path="/schema-builder/:schemaId" element={<SchemaBuilder />} />
        <Route path="/schema-renderer/:schemaId" element={<ReportUpload />} />
        <Route path="/report/:schemaId" element={<ReportDownload />} />
        <Route path="/zones" element={<Zones />} />
      </Routes>
    </Layout>
  );
}

export default App;
