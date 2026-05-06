import { ToastContainer } from "react-toastify";
import { useEffect, lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setUserData } from "./redux/userSlice";
import axios from "axios";
const Home = lazy(() => import("./pages/Home"));
const Auth = lazy(() => import("./pages/Auth"));
const Navbar = lazy(() => import("./components/Navbar"));
const InterviewPage = lazy(() => import("./pages/InterviewPage"));
const InterviewHistory = lazy(() => import("./pages/InterviewHistory"));
const Pricing = lazy(() => import("./pages/Pricing"));
const InterviewReport = lazy(() => import("./pages/InterviewReport"));
const TargetCompanies = lazy(() => import("./pages/TargetCompanies"));
const TargetedInterview = lazy(() => import("./pages/TargetedInterview"));
const FitScore = lazy(() => import("./components/FitScore"));
const SkillRoadmap = lazy(() => import("./components/SkillRoadmap"));
const Leaderboard = lazy(() => import("./components/Leaderboard"));
// export const ServerURL = "https://vettorai-t9ex.onrender.com";
export const ServerURL = import.meta.env.VITE_API_URL;

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

        <Suspense fallback={<div>Loading...</div>}>
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
        <Route
          path="/fit-score"
         element={userData ? <FitScore /> : <Auth/>}
        />
        <Route
          path="/skill-Roadmap"
          element={ <SkillRoadmap />}
        />
        <Route
          path="/leaderboard"
          element={ <Leaderboard />}
        />
        
      </Routes>
</Suspense>
      <ToastContainer />
    </div>
  );
}

export default App;
