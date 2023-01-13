import { Button, Group, TextInput } from "@mantine/core";
import { useInputState } from "@mantine/hooks";
import { api } from "../utils/api";

export default function Search() {
  const [q, setQ] = useInputState("");
  const {
    mutate: sendQuery,
    data,
    isLoading,
  } = api.amazon.search.useMutation();

  function searchQuery() {
    console.log("searchQuery", q);
    sendQuery(q);
  }

  return (
    <>
      <Group position="center" align="flex-end">
        <TextInput
          label="Search query"
          placeholder="tv"
          value={q}
          onChange={setQ}
          onKeyDown={(e) => {
            if (e.key === "Enter") searchQuery();
          }}
        />
        <Button
          onClick={() => {
            searchQuery();
          }}
          loading={isLoading}
        >
          Search
        </Button>
      </Group>
      {!!data && (
        <>
          <p>Search Results:</p>
        </>
      )}
    </>
  );
}
