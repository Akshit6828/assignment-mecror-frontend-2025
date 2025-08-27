import "./App.scss";
import NoInternet from "./components/global/no-internet/no-internet";
import useOnlineStatus from "./hooks/useOnlineStatus";

function App() {
  const [isOnline, warningMessage] = useOnlineStatus();

  return <>{!isOnline && <NoInternet warningMessage={warningMessage} />} </>;
}

export default App;
