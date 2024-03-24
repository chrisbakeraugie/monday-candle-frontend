import { Button, Dropdown, Flex, Label, TextField } from "monday-ui-react-core";
import { useMemo } from "react";
import { useAppContext } from "../../state/AppContext";

const handleSubmit = (event) => {
  event.preventDefault();
  console.log("SUbmitted");
};

const StartOrder = () => {
  const { fragrances } = useAppContext();

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
  return (
    <Flex direction="Column" align="stretch">
      <form onSubmit={handleSubmit}>
        <Flex direction="Row" justify={"SpaceBetween"}>
          <TextField requiredAsterisk title="First Name" required />
          <TextField requiredAsterisk title="Last Name" required />
          <TextField requiredAsterisk title="Quantity" required />
        </Flex>
        <Label>Hello</Label>
        <Dropdown label="Fragrances" options={fragranceOptions}></Dropdown>
        <Button type="submit">Start Order</Button>
      </form>
    </Flex>
  );
};

export default StartOrder;
