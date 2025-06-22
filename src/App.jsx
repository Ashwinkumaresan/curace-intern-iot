import { HashRouter, Route, Routes, useParams } from "react-router-dom"
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

function App() {
  const OrgId = () => {
    const { id } = useParams(); // Extract word from route
    return <OrganizationDetail id = {id}/> ; // Passing as prop
};
  return (
    <HashRouter>
      <Routes>
        <Route path='/' element={<Login />} />
        <Route path='/organization' element={<Organization />} />
        <Route path='/users' element={<Users />} />
        <Route path='/crypto-js' element={<Crypto />} />
        {/* Dynamic route with URL param */}
        <Route path='/organization/:id' element={<OrgId />} />
      </Routes>
    </HashRouter>
  )
}

export default App
