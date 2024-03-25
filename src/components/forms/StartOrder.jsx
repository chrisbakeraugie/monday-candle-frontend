import {
  Box,
  Button,
  Dropdown,
  Flex,
  Label,
  TextField,
} from "monday-ui-react-core";
import { useEffect, useMemo, useRef, useState } from "react";
import { useAppContext } from "../../state/AppContext";
import mondaySdk from "monday-sdk-js";
const monday = mondaySdk();

const StartOrder = () => {
  const { fragrances, mondayContext } = useAppContext();
  const [formData, setFormData] = useState({
    orderName: "",
    selectedFragrances: [],
    firstName: "",
    lastName: "",
    quantity: { value: 1, label: 1 },
    inscription: "",
  });
  const [displayLimit, setDisplayLimit] = useState(false);
  const [successLabel, setSuccessLabel] = useState(false);
  const [failLabel, setFailLabel] = useState(false);
  const [receivedGroupId, setReceivedGroupId] = useState(null);
  const [disableSubmit, setDisableSubmit] = useState(false);
  const currentBoardId = mondayContext?.data?.boardId ?? 6319041765; // TODO remove this reference
  const previousOrderRef = useRef(null);

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

  const handleSelectChange = (selectedItem, event) => {
    switch (event.action) {
      case "clear":
        setFormData((prev) => ({ ...prev, selectedFragrances: [] }));
        break;
      case "select-option":
        if (selectedItem.length <= 3) {
          setFormData((prev) => ({
            ...prev,
            selectedFragrances: selectedItem,
          }));
        } else {
          setDisplayLimit(true);
        }
        break;
      default:
        setFormData((prev) => ({ ...prev, selectedFragrances: selectedItem }));
    }
    if (formData.selectedFragrances.length > 3) {
      return;
    }
  };

  const handleTextFieldChange = (value, field) => {
    setSuccessLabel(false);
    setFailLabel(false);

    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  useEffect(() => {
    if (!currentBoardId) return;
    const getReceivedGroupId = async () => {
      const query = `query getBoardGroups($boardId: ID!) {
        boards(ids: [$boardId]) {
          groups {
            id
            title
          }
        }
      }`;

      try {
        const response = await monday.api(query, {
          variables: { boardId: currentBoardId },
        });
        const groups = response.data.boards[0].groups;
        const receivedGroup = groups.find(
          (group) => group.title === "Received"
        );

        if (receivedGroup) {
          setReceivedGroupId(receivedGroup.id);
        } else {
          console.error("Received group not found");
          return null;
        }
      } catch (error) {
        console.error("Error fetching groups:", error);
        return null;
      }
    };
    getReceivedGroupId();
  }, [currentBoardId, mondayContext]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!formData.quantity?.value) return;
    if (formData.selectedFragrances.length !== 3) {
      setDisplayLimit(true);
      return;
    }
    setDisableSubmit(true);

    const boardId = currentBoardId;
    const groupId = receivedGroupId;
    if (!receivedGroupId) {
      console.error("No groupId");
      return;
    }
    const columnValues = {
      sales_associate: `${formData.firstName} ${formData.lastName}`,
      inscription: formData.inscription,
      status8: null,
      scent_profile: formData.selectedFragrances
        .map((fragrance) => fragrance.label)
        .join(", "),
      quantity: formData.quantity.value,
    };

    const createItemMutation = `mutation createItem($boardId: ID!, $groupId: String!, $itemName: String!, $columnValues: JSON!) {
      create_item(board_id: $boardId, group_id: $groupId, item_name: $itemName, column_values: $columnValues) {
        id
      }
    }`;
    try {
      await monday.api(createItemMutation, {
        variables: {
          boardId,
          groupId,
          itemName:
            formData.orderName === "" ? "New Order" : formData.orderName,
          columnValues: JSON.stringify(columnValues),
        },
      });

      setDisableSubmit(false);
      setSuccessLabel(true);
      setFailLabel(false);
      setDisplayLimit(false);
      previousOrderRef.current = formData.orderName; // To display the name of the last order submitted

      setFormData({
        orderName: "",
        selectedFragrances: [],
        firstName: "",
        lastName: "",
        quantity: { value: 1, label: 1 },
        inscription: "",
      });
    } catch (error) {
      setDisableSubmit(false);
      setSuccessLabel(false);
      setFailLabel(true);
      console.error("Error creating item:", error);
    }
  };

  const handleQuantityChange = (selectedQuantity, event) => {
    switch (event.action) {
      case "clear":
        setFormData((prev) => ({ ...prev, quantity: null }));
        break;
      case "select-option":
        setFormData((prev) => ({ ...prev, quantity: selectedQuantity }));
        break;
      default:
        setFormData((prev) => ({
          ...prev,
          selectedFragrances: selectedQuantity,
        }));
    }
  };

  return (
    <Box
      border={Box.borders.DEFAULT}
      rounded={Box.roundeds.MEDIUM}
      padding={Box.paddings.LARGE}
      className="start-order-box"
    >
      {successLabel && (
        <Label
          text={`Successfully submitted order "${previousOrderRef.current}"`}
        />
      )}
      {failLabel && (
        <Label color="negative" text={`ERROR: Failed to submit order`} />
      )}

      <form onSubmit={handleSubmit}>
        <Flex gap={10} direction="Column" align="stretch">
          <TextField
            onChange={(value) => handleTextFieldChange(value, "orderName")}
            title="Order Name"
            value={formData.orderName}
          ></TextField>
          <Flex gap={10} direction="Row" justify={"SpaceBetween"}>
            <TextField
              onChange={(value) => handleTextFieldChange(value, "firstName")}
              requiredAsterisk
              title="First Name"
              required
              value={formData.firstName}
            />
            <TextField
              onChange={(value) => handleTextFieldChange(value, "lastName")}
              requiredAsterisk
              title="Last Name"
              required
              value={formData.lastName}
            />
          </Flex>
          {!!!formData.quantity?.value && (
            <Label color="negative" text={`Must have quantity of at least 1`} />
          )}
          <Dropdown
            placeholder="Quantity"
            options={[
              { value: 1, label: 1 },
              { value: 2, label: 2 },
              { value: 3, label: 3 },
            ]}
            defaultValue={formData.quantity}
            requiredAsterisk
            onChange={handleQuantityChange}
            value={formData.quantity}
          />
          {displayLimit && <Label text="Must be exactly 3 fragrances" />}
          <Dropdown
            multi
            placeholder="Choose 3 Fragrances"
            options={fragranceOptions}
            className="dropdown-stories-styles_with-chips"
            onChange={handleSelectChange}
            value={formData.selectedFragrances}
          />
          <TextField
            onChange={(value) => handleTextFieldChange(value, "inscription")}
            title="Inscription"
            value={formData.inscription}
          ></TextField>
          <Button disabled={disableSubmit} type="submit">
            Start Order
          </Button>
        </Flex>
      </form>
    </Box>
  );
};

export default StartOrder;
