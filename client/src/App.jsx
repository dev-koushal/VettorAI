import { ToastContainer } from "react-toastify";
import Home from "./pages/Home";
import Auth from "./pages/Auth";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import { useEffect } from "react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { setUserData } from "./redux/userSlice";
import InterviewPage from "./pages/InterviewPage";
import InterviewHistory from "./pages/InterviewHistory";
import Pricing from "./pages/Pricing";
import InterviewReport from "./pages/InterviewReport"
import TargetCompanies from "./pages/TargetCompanies";
import TargetedInterview from "./pages/TargetedInterview";
export const ServerURL = "http://localhost:8000";

export const getCurrentUser = async (dispatch) => {
  try {
    const result = await axios.get(`${ServerURL}/api/user/current-user`, {
      withCredentials: true,
    });
    // console.log(result.data);
    dispatch(setUserData(result.data));
  } catch (error) {
    console.error("Error fetching current user:", error);
    dispatch(setUserData(null));
  }
};

function App() {
  const dispatch = useDispatch();
  const { userData } = useSelector((state) => state.user);
  useEffect(() => {
    getCurrentUser(dispatch);
  }, [dispatch]);

  return (
    <div className="min-h-screen w-full">
      <Navbar  />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/auth" element={userData ? <Home /> : <Auth /> } />
        <Route
          path="/interview"
          element={userData ? <InterviewPage /> : <Auth />}
        />
        <Route
          path="/history"
          element={userData ? <InterviewHistory /> : <Auth />}
        />
        <Route
          path="/report/:interviewId"
          element={userData ? <InterviewReport /> : <Auth />}
        />
        <Route
          path="/pricing"
          element={userData ? <Pricing /> : <Auth />}
        />
        <Route
          path="/target-companies"
          element={ <TargetCompanies />}
        />
        <Route
          path="/target-companies/interview"
          element={ <TargetedInterview />}
        />
      </Routes>

      <ToastContainer />
    </div>
  );
}

export default App;
