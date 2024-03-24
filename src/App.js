import React from "react";
import { useEffect } from "react";
import "./App.css";
import mondaySdk from "monday-sdk-js";
import "monday-ui-react-core/dist/main.css";
import axios from "axios";
import { useAppContext } from "./state/AppContext";
import StartOrder from "./components/forms/StartOrder";

// Usage of mondaySDK example, for more information visit here: https://developer.monday.com/apps/docs/introduction-to-the-sdk/
const monday = mondaySdk();

const App = () => {
  const { setMondayContext, setFragrances } = useAppContext();

  useEffect(() => {
    // Notice this method notifies the monday platform that user gains a first value in an app.
    // Read more about it here: https://developer.monday.com/apps/docs/mondayexecute#value-created-for-user/
    monday.execute("valueCreatedForUser");

    // TODO: set up event listeners, Here`s an example, read more here: https://developer.monday.com/apps/docs/mondaylisten/
    monday.listen("context", (res) => {
      setMondayContext(res.data);
    });

    const fetchFragrances = async () => {
      try {
        const response = await axios.get("http://localhost:3000/fragrance/");
        setFragrances(response.data);
      } catch (error) {
        console.log(error);
        console.error("Could not fetch fragrances");
      }
    };

    fetchFragrances();
  }, [setFragrances, setMondayContext]);

  return (
    <div className="App">
      <StartOrder />
    </div>
  );
};

export default App;
