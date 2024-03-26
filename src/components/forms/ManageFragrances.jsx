import React, { useMemo, useState } from "react";
import axios from "axios";
import { Box, Button, Dropdown, Flex, TextField } from "monday-ui-react-core";
import { useAppContext } from "../../state/AppContext";

const ManageFragrances = () => {
  const { fragrances } = useAppContext();
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
      const response = await axios.post(
        `${process.env.REACT_APP_SERVER_URL}/fragrance/`,
        createData
      );
      console.log(response.data);
      setDisable(false);
    } catch (error) {
      console.error(error);
      setDisable(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setDisable(true);
    try {
      console.log(updateData);

      const response = await axios.put(
        `${process.env.REACT_APP_SERVER_URL}/fragrance/${updateData._id}`,
        updateData
      );
      console.log(response.data);
      setDisable(false);
    } catch (error) {
      console.error(error);
      setDisable(false);
    }
  };

  const handleDelete = async (e) => {
    e.preventDefault();
    setDisable(true);
    // eslint-disable-next-line no-restricted-globals
    if (!confirm(`Are you sure you want to delete ${deleteItem.label}`)) return;
    try {
      const response = await axios.delete(
        `${process.env.REACT_APP_SERVER_URL}/fragrance/${deleteItem.value}`
      );
      console.log(response.data);
      setDisable(false);
    } catch (error) {
      console.error(error);
      setDisable(false);
    }
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
    console.log(chosenFragrance);
    setUpdateData({ ...chosenFragrance });
  };

  const handleDeleteChange = (selectedItem) => {
    setDeleteItem(selectedItem);
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
    </Box>
  );
};

export default ManageFragrances;
