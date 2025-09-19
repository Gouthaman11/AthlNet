import React from "react";
import Routes from "./Routes";
import { AuthProvider } from "./contexts/AuthContext";

// Import debug utilities to make them available globally
import "./utils/safeLogging";
import "./utils/debugNewUserMessaging";
import "./utils/debugVideoUploads";

function App() {
  return (
    <AuthProvider>
      <Routes />
    </AuthProvider>
  );
}

export default App;
