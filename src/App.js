import React, { useState } from "react";
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
  const { setMondayContext, setFragrances, mondayContext } = useAppContext();
  const [isGroupCreationStarted, setIsGroupCreationStarted] = useState(false);
  const [isBoardColumnsCreationStarted, setIsBoardColumnsCreationStarted] =
    useState(false);

  useEffect(() => {
    // Notice this method notifies the monday platform that user gains a first value in an app.
    // Read more about it here: https://developer.monday.com/apps/docs/mondayexecute#value-created-for-user/
    monday.execute("valueCreatedForUser");

    // TODO: set up event listeners, Here`s an example, read more here: https://developer.monday.com/apps/docs/mondaylisten/
    monday.listen("context", (res) => {
      setMondayContext(res.data);
    });
  }, [setFragrances, setMondayContext]);

  useEffect(() => {
    const currentBoardId = mondayContext?.data?.boardId ?? 6319041765; // TODO remove this reference
    const fetchFragrances = async () => {
      try {
        const response = await axios.get("http://localhost:3000/fragrance/");
        setFragrances(response.data);
      } catch (error) {
        console.error("Could not fetch fragrances", error);
      }
    };

    const checkAndCreateColumns = async () => {
      setIsBoardColumnsCreationStarted(true);
      try {
        const columnsQuery = `query ($boardId: ID!) { boards(ids: [$boardId]) { columns { id title }  } }`;
        const existingColumnsResponse = await monday.api(columnsQuery, {
          variables: { boardId: currentBoardId },
        });
        const existingColumns = existingColumnsResponse.data.boards[0].columns;
        const existingColumnTitles = existingColumns.map(
          (column) => column.title
        );

        const createColumnMutation = `mutation createColumn($boardId: ID!, $title: String!, $columnType: ColumnType!) {
          create_column(board_id: $boardId, title: $title, column_type: $columnType) {
            id
          }
        }`;

        const columnDetails = [
          { title: "Sales Associate", columnType: "text" },
          { title: "Inscription", columnType: "text" },
          {
            title: "Status",
            columnType: "status",
          },
          { title: "Scent Profile", columnType: "text" },
          { title: "Quantity", columnType: "numbers" },
        ];

        for (const { title, columnType } of columnDetails) {
          if (!existingColumnTitles.includes(title)) {
            await monday.api(createColumnMutation, {
              variables: { boardId: currentBoardId, title, columnType },
            });
          }
        }
      } catch (error) {
        console.error("Error checking columns:", error);
      }
    };

    const checkAndCreateGroups = async () => {
      setIsGroupCreationStarted(true);
      const query = `query ($boardId: [ID!]) {
        boards(ids: $boardId) {
          groups {
            id
            title
          }
        }
      }`;

      try {
        const existingGroupsResponse = await monday.api(query, {
          variables: { boardId: [currentBoardId] },
        });
        const existingGroups = existingGroupsResponse.data.boards[0].groups;
        const requiredGroups = ["Done", "Working On It", "Received"];
        const existingGroupTitles = existingGroups.map((group) => group.title);

        for (let groupName of requiredGroups) {
          if (!existingGroupTitles.includes(groupName)) {
            const createGroupMutation = `mutation ($boardId: ID!, $groupName: String!) {
              create_group(board_id: $boardId, group_name: $groupName) {
                id
              }
            }`;

            await monday.api(createGroupMutation, {
              variables: { boardId: currentBoardId, groupName }, // Corrected variable name
            });
          }
        }
      } catch (error) {
        console.error("Error checking/creating groups:", error);
      }
    };
    if (currentBoardId && !isBoardColumnsCreationStarted) {
      checkAndCreateColumns();
    }
    if (currentBoardId && !isGroupCreationStarted) {
      checkAndCreateGroups();
    }
    fetchFragrances();
  }, [
    isBoardColumnsCreationStarted,
    isGroupCreationStarted,
    mondayContext,
    setFragrances,
  ]);

  return (
    <div className="App">
      <StartOrder />
    </div>
  );
};

export default App;
