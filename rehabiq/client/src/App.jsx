import { useState } from "react";
import Sidebar from "./components/Layout/Sidebar";
import Dashboard from "./components/Dashboard/Dashboard";
import SessionDoc from "./components/SessionDoc/SessionDoc";
import ClientView from "./components/ClientView/ClientView";
import NewClient from "./components/NewClient/NewClient";

export default function App() {
  const [view, setView] = useState("dashboard");
  const [selectedClientId, setSelectedClientId] = useState(null);

  function navigateTo(newView, clientId = null) {
    setView(newView);
    if (clientId) setSelectedClientId(clientId);
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        currentView={view}
        onNavigate={navigateTo}
      />
      <main className="flex-1 overflow-y-auto">
        {view === "dashboard" && (
          <Dashboard
            onSelectClient={(id) => navigateTo("client", id)}
            onDocumentSession={(id) => navigateTo("session", id)}
          />
        )}
        {view === "session" && (
          <SessionDoc
            clientId={selectedClientId}
            onBack={() => navigateTo("dashboard")}
            onViewClient={(id) => navigateTo("client", id)}
          />
        )}
        {view === "client" && (
          <ClientView
            clientId={selectedClientId}
            onBack={() => navigateTo("dashboard")}
            onDocumentSession={(id) => navigateTo("session", id)}
          />
        )}
      </main>
    </div>
  );
}