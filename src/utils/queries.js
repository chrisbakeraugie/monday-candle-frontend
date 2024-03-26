import mondaySdk from "monday-sdk-js";
const monday = mondaySdk();

export const checkForBoardByName = async (caseSensitiveName) => {
  const query = `query {
        boards (limit: 200) {
          id
          name
        }
      }`;

  try {
    const response = await monday.api(query);
    const boards = response.data.boards;

    const foundBoards = boards.find(
      (board) => board.name === caseSensitiveName
    );

    if (foundBoards) {
      console.log("Board exists.");
      return foundBoards.id;
    } else {
      console.log("Board does not exist.");
      return false;
    }
  } catch (error) {
    console.error(`Error checking for ${caseSensitiveName} board:`, error);
    return false;
  }
};

export const createBoardByName = async (caseSensitiveName, kind = "public") => {
  const mutation = `mutation createBoard($boardName: String!, $boardKind: BoardKind!) {
    create_board(board_name: $boardName, board_kind: $boardKind) {
      id
    }
  }`;

  try {
    const variables = {
      boardName: caseSensitiveName,
      boardKind: kind,
    };

    const response = await monday.api(mutation, { variables });
    const boardId = response.data.create_board.id;

    console.log(`Board created successfully with ID: ${boardId}`);
    return boardId;
  } catch (error) {
    console.error("Error creating board:", error);
    throw error;
  }
};

/**
 * Creates columns in a board using array of objects
 *
 * @param {String} boardId The ID of the board where columns will be created.
 * @param {Array} arrayOfFields An array of objects, each containing the name and type of the column to create.
 */
export const createColumnsInBoard = async (boardId, arrayOfFields) => {
  try {
    for (const field of arrayOfFields) {
      const { fieldName, type } = field;

      const mutation = `mutation createColumn($boardId: ID!, $title: String!, $columnType: ColumnType!) {
        create_column(board_id: $boardId, title: $title, column_type: $columnType) {
          id
        }
      }`;

      const variables = {
        boardId: parseInt(boardId), // Ensure boardId is an integer
        title: fieldName,
        columnType: type,
      };

      const response = await monday.api(mutation, { variables });
      console.log(
        `Column created: ${fieldName} with ID: ${response.data.create_column.id}`
      );
    }

    console.log("All columns created successfully.");
  } catch (error) {
    console.error("Error creating columns:", error);
    throw error;
  }
};
