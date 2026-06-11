import { createSlice } from "@reduxjs/toolkit";

const getStoredResume = () => {
  if (typeof window === "undefined") return {
    name: "",
    text: "",
    role: "",
    experience: "",
    projects: [],
    skills: [],
  };

  try {
    const stored = window.localStorage.getItem("resumeData");
    return stored
      ? JSON.parse(stored)
      : {
          name: "",
          text: "",
          role: "",
          experience: "",
          projects: [],
          skills: [],
        };
  } catch {
    return {
      name: "",
      text: "",
      role: "",
      experience: "",
      projects: [],
      skills: [],
    };
  }
};

const saveResume = (payload) => {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem("resumeData", JSON.stringify(payload));
  } catch {
    // ignore storage errors
  }
};

const initialState = {
  userData: null,
  resumeData: getStoredResume(),
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUserData: (state, action) => {
      state.userData = action.payload;
    },
    setResumeData: (state, action) => {
      state.resumeData = action.payload;
      saveResume(action.payload);
    },
    clearResumeData: (state) => {
      state.resumeData = {
        name: "",
        text: "",
        role: "",
        experience: "",
        projects: [],
        skills: [],
      };
      saveResume(state.resumeData);
    },
  },
});

export const { setUserData, setResumeData, clearResumeData } = userSlice.actions;
export default userSlice.reducer;

