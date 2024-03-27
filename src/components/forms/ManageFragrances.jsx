import React, { useMemo, useState } from "react";
import axios from "axios";
import {
  Box,
  Button,
  Dropdown,
  Flex,
  TextField,
  Toggle,
} from "monday-ui-react-core";
import { useAppContext } from "../../state/AppContext";
import {
  checkForBoardByName,
  createBoardByName,
  createColumnsInBoard,
} from "../../utils/queries";
import FragrancesMondayService from "../../services/FragrancesMondayService";

const ManageFragrances = () => {
  const {
    fragrances,
    storeFragrancesOnMonday,
    setStoreFragrancesOnMonday,
    setFragrances,
    fragranceBoardId,
    setFragranceBoardId,
  } = useAppContext();
  const [disable, setDisable] = useState(false);
  const [createData, setCreateData] = useState({
    name: "",
    description: "",
    category: "",
    image_url: "",
  });
  const [updateData, setUpdateData] = useState({
    id: "",
    name: "",
    description: "",
    category: "",
    image_url: "",
  });
  const [deleteItem, setDeleteItem] = useState(null);

  const fragranceOptions = useMemo(() => {
    const formattedOptions = fragrances
      .map((fragrance) => ({
        label: fragrance.name,
        value: fragrance._id,
      }))
      .sort((a, b) => {
        if (a.label < b.label) {
          return -1;
        }
        if (a.label > b.label) {
          return 1;
        }
        return 0;
      });
    return formattedOptions;
  }, [fragrances]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setDisable(true);
    try {
      if (storeFragrancesOnMonday) {
        const fragrancesService = new FragrancesMondayService(fragranceBoardId);
        await fragrancesService.createFragrance(createData);
        fetchFragrances(fragranceBoardId);
        setDisable(false);
      } else {
        const response = await axios.post(
          `${process.env.REACT_APP_SERVER_URL}/fragrance/`,
          createData
        );
        setDisable(false);
        fetchFragrances();
      }
    } catch (error) {
      console.error(error);
      setDisable(false);
    }
    setCreateData({ name: "", description: "", category: "", image_url: "" });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setDisable(true);
    try {
      if (storeFragrancesOnMonday) {
        const fragrancesService = new FragrancesMondayService(fragranceBoardId);
        await fragrancesService.updateFragranceById(updateData._id, updateData);
        fetchFragrances(fragranceBoardId);
        setDisable(false);
      } else {
        const response = await axios.put(
          `${process.env.REACT_APP_SERVER_URL}/fragrance/${updateData._id}`,
          updateData
        );
        setDisable(false);
        fetchFragrances();
      }
    } catch (error) {
      console.error(error);
      setDisable(false);
    }
    setUpdateData({
      id: "",
      name: "",
      description: "",
      category: "",
      image_url: "",
    });
  };

  const handleDelete = async (e) => {
    e.preventDefault();
    // eslint-disable-next-line no-restricted-globals
    if (!confirm(`Are you sure you want to delete ${deleteItem.label}`)) return;
    setDisable(true);
    try {
      if (storeFragrancesOnMonday) {
        const fragranceService = new FragrancesMondayService(fragranceBoardId);
        await fragranceService.deleteFragranceById(deleteItem.value);
        fetchFragrances(fragranceBoardId);
        setDisable(false);
      } else {
        const response = await axios.delete(
          `${process.env.REACT_APP_SERVER_URL}/fragrance/${deleteItem.value}`
        );
        setDisable(false);
        fetchFragrances();
      }
    } catch (error) {
      console.error(error);
      setDisable(false);
    }
    setDeleteItem(null);
  };

  const handleUpdateChange = (selectedItem, action) => {
    if (action === "clear")
      setUpdateData({
        id: "",
        name: "",
        description: "",
        category: "",
      });
    const chosenFragrance = fragrances.filter(
      (fragrance) => fragrance._id === selectedItem.value
    )[0];
    setUpdateData({ ...chosenFragrance });
  };

  const handleDeleteChange = (selectedItem) => {
    setDeleteItem(selectedItem);
  };

  const handleFragranceSourceChange = async (storeOnMonday) => {
    if (!storeOnMonday) {
      setStoreFragrancesOnMonday(false);
      return;
    }
    setStoreFragrancesOnMonday(true);

    const fragranceBoardSetup = async () => {
      try {
        const boardId = await checkForBoardByName("Fragrances");
        if (boardId) {
          const fragrancesService = new FragrancesMondayService(boardId);
          const allFragrances = await fragrancesService.getAllFragrances();
          setFragrances(allFragrances);
          setFragranceBoardId(boardId);
        } else {
          const createdBoardId = await createBoardByName("Fragrances");
          await createColumnsInBoard(createdBoardId, [
            { fieldName: "description", type: "text" },
            { fieldName: "category", type: "text" },
            { fieldName: "image_url", type: "text" },
            { fieldName: "created_at", type: "date" },
            { fieldName: "updated_at", type: "date" },
          ]);
          setFragranceBoardId(createdBoardId);
        }
      } catch (error) {
        console.error(error);
      }
    };

    fragranceBoardSetup();
  };

  const fetchFragrances = async (boardId) => {
    if (boardId) {
      const fragranceService = new FragrancesMondayService(boardId);
      const fragrances = await fragranceService.getAllFragrances();
      setFragrances(fragrances);
    } else {
      const response = await axios.get(
        `${process.env.REACT_APP_SERVER_URL}/fragrance/`
      );
      setFragrances(response.data);
    }
  };

  return (
    <Box
      border={Box.borders.DEFAULT}
      rounded={Box.roundeds.MEDIUM}
      padding={Box.paddings.LARGE}
      className="fragrance-box start-order-box"
    >
      <Flex gap={10} direction="Row" align="Initial">
        <Box
          border={Box.borders.DEFAULT}
          rounded={Box.roundeds.MEDIUM}
          padding={Box.paddings.LARGE}
          className="fragrance-box start-order-box"
        >
          <form onSubmit={handleCreate}>
            <Button disable={disable} type="submit">
              Create Fragrance
            </Button>
            <TextField
              value={createData.name}
              onChange={(value) =>
                setCreateData({ ...createData, name: value })
              }
              title="Name"
            />
            <TextField
              value={createData.description}
              onChange={(value) =>
                setCreateData({ ...createData, description: value })
              }
              title="Description"
            />
            <TextField
              value={createData.category}
              onChange={(value) =>
                setCreateData({ ...createData, category: value })
              }
              title="Category"
            />
            <TextField
              value={createData.image_url}
              onChange={(value) =>
                setCreateData({ ...createData, image_url: value })
              }
              title="Image URL"
            />
          </form>
        </Box>
        <Box
          border={Box.borders.DEFAULT}
          rounded={Box.roundeds.MEDIUM}
          padding={Box.paddings.LARGE}
          className="fragrance-box start-order-box"
        >
          <form onSubmit={handleUpdate}>
            <Button disable={disable} type="submit">
              Update Fragrance
            </Button>
            <Dropdown
              placeholder="Fragrance to Update"
              options={fragranceOptions}
              className="dropdown-stories-styles_with-chips"
              onChange={handleUpdateChange}
            />
            <TextField
              title="Name"
              value={updateData.name}
              onChange={(value) =>
                setUpdateData({ ...updateData, name: value })
              }
              placeholder="New Name"
            />
            <TextField
              title="Description"
              value={updateData.description}
              onChange={(value) =>
                setUpdateData({ ...updateData, description: value })
              }
              placeholder="New Description"
            />
            <TextField
              title="Category"
              value={updateData.category}
              onChange={(value) =>
                setUpdateData({ ...updateData, category: value })
              }
              placeholder="New Category"
            />
            <TextField
              title="image_url"
              value={updateData.image_url}
              onChange={(value) =>
                setUpdateData({ ...updateData, image_url: value })
              }
              placeholder="Image URL"
            />
          </form>
        </Box>
        <Box
          border={Box.borders.DEFAULT}
          rounded={Box.roundeds.MEDIUM}
          padding={Box.paddings.LARGE}
          className="fragrance-box start-order-box"
        >
          <form onSubmit={handleDelete}>
            <Button disable={disable} type="submit">
              Delete Fragrance
            </Button>
            <Dropdown
              placeholder="Fragrance to Delete"
              options={fragranceOptions}
              className="dropdown-stories-styles_with-chips"
              onChange={handleDeleteChange}
            />
          </form>
        </Box>
      </Flex>
      <h6>Use Monday.Com to Store Fragrances</h6>
      <Toggle
        onChange={handleFragranceSourceChange}
        isDefaultSelected={storeFragrancesOnMonday}
      />
    </Box>
  );
};

export default ManageFragrances;
