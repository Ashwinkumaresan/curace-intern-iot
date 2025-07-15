import { HashRouter, Route, Routes, useParams } from "react-router-dom"
import { useEffect } from "react"
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'
import 'bootstrap-icons/font/bootstrap-icons.css'
import './App.css'

// page imports
import Organization from './Pages/Organization'
import Users from './Pages/Users'
import { Crypto } from './Component/Crypto'
import Login from './Pages/Login'
import OrganizationDetail from "./Pages/OrganisationDetail"
import { SetPassword } from "./Pages/SetPassword"
import Dashboard from "./Component/Device Components/Dashboard"

function App() {

  // Function to check if 1 hour has passed and clear localStorage
  const checkAndClearStorage = () => {
    const storedTimestamp = localStorage.getItem("timestamp");

    if (storedTimestamp) {
      const currentTime = new Date().getTime();
      const timeDifference = currentTime - storedTimestamp;

      // If time difference is more than or equal to 1 hour (3600000 ms)
      if (timeDifference >= 3600000) {
        localStorage.clear();
        console.log("LocalStorage cleared after 1 hour.");
      } else {
        console.log("Within 1 hour — data preserved.");
      }
    }
  };

  // useEffect to check on component mount
  useEffect(() => {
    checkAndClearStorage();

    // Optional: run check every 1 minute while app is open
    const interval = setInterval(() => {
      checkAndClearStorage();
    }, 60000); // 60000 ms = 1 min

    return () => clearInterval(interval); // cleanup interval on unmount
  }, []);

  const OrgId = () => {
    const { id } = useParams(); // Extract word from route
    return <OrganizationDetail id={id} />; // Passing as prop
  };
  const SetPasswordPara = () => {
    const { passwordId } = useParams(); // Extract word from route
    return <SetPassword passwordId={passwordId} />; // Passing as prop
  };
  return (
    <HashRouter>
      <Routes>

        {/* Define routes for different pages */}
        <Route path='/' element={<Login />} />
        <Route path='/organization' element={<Organization />} />
        <Route path='/users' element={<Users />} />
        <Route path='/crypto-js' element={<Crypto />} />

        {/* Dynamic route with URL param */}
        <Route path='/organization/:id' element={<OrgId />} />
        <Route path='/set-password/:passwordId' element={<SetPasswordPara />} />

        {/* Device */}
        <Route path="/device/details" element={<Dashboard/>} />
        
      </Routes>
    </HashRouter>
  )
}

export default App
