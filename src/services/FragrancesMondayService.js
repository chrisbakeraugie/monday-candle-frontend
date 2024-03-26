const mondaySdk = require("monday-sdk-js");
const monday = mondaySdk();

class FragrancesMondayService {
  constructor(boardId) {
    this.boardId = boardId;
  }

  async createFragrance(values) {
    const today = new Date();
    const formattedDate = today.toISOString().split("T")[0];
    const mutation = `
    mutation createItem($boardId: ID!, $itemName: String!, $columnValues: JSON!) {
      create_item(board_id: $boardId, item_name: $itemName, column_values: $columnValues) {
        id
      }
    }`;

    try {
      const variables = {
        boardId: this.boardId,
        itemName: values.name || "New Fragrance",
        columnValues: JSON.stringify({
          ...values,
          created_at: formattedDate,
          updated_at: formattedDate,
        }),
      };

      const response = await monday.api(mutation, { variables });
      console.log(
        `Fragrance created successfully with ID: ${response.data.create_item.id}`
      );
      return response.data.create_item.id;
    } catch (error) {
      console.error("Error creating fragrance:", error);
      throw error;
    }
  }

  async deleteFragranceById(itemId) {
    const mutation = `
    mutation($itemId: ID!) {
      delete_item (item_id: $itemId) {
        id
      }
    }`;

    try {
      const variables = { itemId };
      const response = await monday.api(mutation, { variables });
      console.log(`Item with ID ${itemId} has been deleted successfully.`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting item with ID ${itemId}:`, error);
      throw error;
    }
  }

  async updateFragranceById(fragranceId, values) {
    const today = new Date();
    const formattedDate = today.toISOString().split("T")[0];
    const mutation =
      "mutation ($myBoardId:ID!, $myItemId:ID!, $myColumnValues:JSON!) { change_multiple_column_values(item_id:$myItemId, board_id:$myBoardId, column_values: $myColumnValues) { id } }";
    const variables = {
      myBoardId: this.boardId,
      myItemId: fragranceId,
      myColumnValues: JSON.stringify({ ...values, updated_at: formattedDate }),
    };
    try {
      const response = await monday.api(mutation, { variables });
      console.log(response);
    } catch (error) {
      console.log(error);
    }
  }

  /**
   *
   * @returns Fragrance data formatted to be very similar to mongoDB versions of data
   */
  async getAllFragrances() {
    const query = `query ($boardId: [ID!]) {
        boards(ids: $boardId) {
          items_page(limit: 500) {
            cursor
            items {
              id
              name
              column_values {
                column {
                  title
                }
                text
                value
              }
            }
          }
        }
      }`;

    try {
      const variables = { boardId: [this.boardId] };
      const response = await monday.api(query, { variables });
      const itemsArray = response?.data?.boards[0]?.items_page?.items;
      if (itemsArray.length > 0) {
        const formattedData = itemsArray.map((item) => {
          let formattedObject = {
            _id: item.id,
            name: item.name,
            description: "",
            category: "",
            image_url: "",
            created_at: "",
            updated_at: "",
          };
          for (let i = 0; i < item.column_values.length; i++) {
            formattedObject = {
              ...formattedObject,
              [item.column_values[i].column.title]: item.column_values[i].text,
            };
          }
          return formattedObject;
        });

        return formattedData;
      } else {
        console.log(
          `No board found with ID ${this.boardId} or no items exist on the board.`
        );
        return [];
      }
    } catch (error) {
      console.error("Error fetching all fragrances:", error);
      throw error; // Or handle it as needed for your application
    }
  }

  //   async getFragranceByName() {}

  async getFragranceById(id) {
    console.log("the id", id);
    const query = `query ($itemId: [ID!]) {
            items(ids: $itemId) {
              id
              name
              column_values {
                id
                text
                value
              }
            }
    }`;

    try {
      const response = await monday.api(query, {
        variables: {
          itemId: [id],
        },
      });

      const item = response.data.items[0];
      if (!item) {
        console.log(`Fragrance with ID ${id} not found.`);
        return null;
      }

      // Process the column values to extract specific fields
      const processedItem = {
        _id: item.id,
        name: item.name,
        description: "",
        category: "",
        image_url: "",
        created_at: "",
        updated_at: "",
      };

      item.column_values.forEach((column) => {
        switch (column.id) {
          case "description":
            processedItem.description = column.text;
            break;
          case "category":
            processedItem.category = column.text;
            break;
          case "image_url":
            processedItem.image_url = column.text;
            break;
          case "created_at":
            processedItem.createdAt = column.text;
            break;
          case "updated_at":
            processedItem.updatedAt = column.text;
            break;
          default:
        }
      });

      return processedItem;
    } catch (error) {
      console.error(`Error fetching fragrance with ID ${id}:`, error);
      throw error;
    }
  }
}

module.exports = FragrancesMondayService;
