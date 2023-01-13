import {
  Button,
  Container,
  Group,
  NumberInput,
  Space,
  Stack,
  Table,
  TextInput,
  Title,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useClipboard } from "@mantine/hooks";
import { api } from "../utils/api";

export default function Search() {
  const clipboard = useClipboard({ timeout: 500 });

  const {
    mutate: sendQuery,
    data,
    isLoading,
  } = api.amazon.search.useMutation();

  const form = useForm({
    initialValues: {
      q: "",
      pages: 1,
    },
  });

  return (
    <>
      <Container size={550}>
        <form onSubmit={form.onSubmit((values) => sendQuery(values))}>
          <Stack>
            <Group grow>
              <TextInput
                label="Search query"
                placeholder="tv"
                {...form.getInputProps("q")}
              />
              <NumberInput
                label="Pages"
                // style={{ flexBasis: 70 }}
                {...form.getInputProps("pages")}
              />
            </Group>
            <Button type="submit" loading={isLoading} fullWidth>
              Search
            </Button>
          </Stack>
        </form>
      </Container>

      <Space h={50} />

      {!!data && (
        <Stack>
          <Group position="apart">
            <Title order={3}>Search Results</Title>
            <Button
              color={clipboard.copied ? "teal" : "blue"}
              onClick={() => {
                clipboard.copy(data.csv);
              }}
            >
              {clipboard.copied ? "Copied!" : "Copy"}
            </Button>
          </Group>

          <Table>
            <thead>
              <tr>
                <th>#</th>
                <th>ASIN</th>
                <th>Title</th>
                <th>Price</th>
                <th>Rating</th>
              </tr>
            </thead>
            <tbody>
              {data.results.map((item) => (
                <tr key={item.asin}>
                  <td>{item["#"]}</td>
                  <td>{item.asin}</td>
                  <td>{item.title}</td>
                  <td>{item.price}</td>
                  <td>{item.rating}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Stack>
      )}
    </>
  );
}
