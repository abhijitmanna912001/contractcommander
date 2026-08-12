import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./App.css";
import { DisclaimerBanner } from "./components/DisclaimerBanner";
import { Home } from "./pages/Home";
import { Report } from "./pages/Report";

function App() {
  return (
    <BrowserRouter>
      <div className="app-shell">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/report/:id" element={<Report />} />
        </Routes>
        <DisclaimerBanner />
      </div>
    </BrowserRouter>
  );
}

export default App;
