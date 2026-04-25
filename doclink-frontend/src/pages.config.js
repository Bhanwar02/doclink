/**
 * pages.config.js - Page routing configuration
 * 
 * This file is AUTO-GENERATED. Do not add imports or modify PAGES manually.
 * Pages are auto-registered when you create files in the ./pages/ folder.
 * 
 * THE ONLY EDITABLE VALUE: mainPage
 * This controls which page is the landing page (shown when users visit the app).
 * 
 * Example file structure:
 * 
 *   import HomePage from './pages/HomePage';
 *   import Dashboard from './pages/Dashboard';
 *   import Settings from './pages/Settings';
 *   
 *   export const PAGES = {
 *       "HomePage": HomePage,
 *       "Dashboard": Dashboard,
 *       "Settings": Settings,
 *   }
 *   
 *   export const pagesConfig = {
 *       mainPage: "HomePage",
 *       Pages: PAGES,
 *   };
 * 
 * Example with Layout (wraps all pages):
 *
 *   import Home from './pages/Home';
 *   import Settings from './pages/Settings';
 *   import __Layout from './Layout.jsx';
 *
 *   export const PAGES = {
 *       "Home": Home,
 *       "Settings": Settings,
 *   }
 *
 *   export const pagesConfig = {
 *       mainPage: "Home",
 *       Pages: PAGES,
 *       Layout: __Layout,
 *   };
 *
 * To change the main page from HomePage to Dashboard, use find_replace:
 *   Old: mainPage: "HomePage",
 *   New: mainPage: "Dashboard",
 *
 * The mainPage value must match a key in the PAGES object exactly.
 */
import AdminAppointments from './pages/AdminAppointments';
import AdminMedicines from './pages/AdminMedicines';
import AdminOrders from './pages/AdminOrders';
import AdminProfileSettings from './pages/AdminProfileSettings';
import AdminSeminars from './pages/AdminSeminars';
import AdminUsers from './pages/AdminUsers';
import DoctorAppointments from './pages/DoctorAppointments';
import DoctorPrescriptions from './pages/DoctorPrescriptions';
import DoctorProfile from './pages/DoctorProfile';
import DoctorProfileSettings from './pages/DoctorProfileSettings';
import FindDoctors from './pages/FindDoctors';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import Home from './pages/Home';
import LoginPage from "./pages/LoginPage";
import ManageDoctors from './pages/ManageDoctors';
import MyAppointments from './pages/MyAppointments';
import MyOrders from './pages/MyOrders';
import MyPrescriptions from './pages/MyPrescriptions';
import OrderMedicines from './pages/OrderMedicines';
import Profile from './pages/Profile';
import RegisterPage from "./pages/RegisterPage";
import Seminars from './pages/Seminars';
import SignupPage from "./pages/SignupPage";
import __Layout from './Layout.jsx';


export const PAGES = {
    "AdminAppointments": AdminAppointments,
    "AdminMedicines": AdminMedicines,
    "AdminOrders": AdminOrders,
    "AdminProfileSettings": AdminProfileSettings,
    "AdminSeminars": AdminSeminars,
    "AdminUsers": AdminUsers,
    "DoctorAppointments": DoctorAppointments,
    "DoctorPrescriptions": DoctorPrescriptions,
    "DoctorProfile": DoctorProfile,
    "DoctorProfileSettings": DoctorProfileSettings,
    "FindDoctors": FindDoctors,
    "ForgotPasswordPage": ForgotPasswordPage,
    "Home": Home,
    "LoginPage":LoginPage,
    "ManageDoctors": ManageDoctors,
    "MyAppointments": MyAppointments,
    "MyOrders": MyOrders,
    "MyPrescriptions": MyPrescriptions,
    "OrderMedicines": OrderMedicines,
    "Profile": Profile,
    "Register": RegisterPage,
    "Seminars": Seminars,
    "SignupPage": SignupPage,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};