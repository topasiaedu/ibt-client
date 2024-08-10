import debounce from "lodash.debounce";
import React, { useCallback, useEffect } from "react";
import { Handle, NodeProps, Position } from "reactflow";
import { useContactListContext } from "../../../../context/ContactListContext";
import { Select, Label, Button, Badge } from "flowbite-react";
import { useFlowContext } from "../../../../context/FlowContext";

export type AddToContactListData = {
  listId?: string;
  listIds?: number[];
  currentIndex: number;
};

export default function AddToContactListNode(
  props: NodeProps<AddToContactListData>
) {
  const [listId, setListId] = React.useState(props.data?.listId ?? "");
  const { contactLists } = useContactListContext();
  const { removeNode, updateNodeData } = useFlowContext();
  const [lists, setLists] = React.useState<any[]>([]);
  const [listIdInput, setListIdInput] = React.useState<string>("");

  const removeListId = (listId: string) => {
    setLists((prev) => prev.filter((c) => c !== listId));
  };

  const handleListIdInputChange = (e: { target: { value: any } }) => {
    const value = e.target.value;
    setListIdInput(value);
  };

  const handleListIdKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && listIdInput.trim() !== "") {
      setLists((prev) => [...prev, listIdInput]);
      setListIdInput("");
    }
  };

  const handleContactListClick = (contactList: any) => {
    setLists((prev) => [...prev, contactList]);
    setListIdInput("");
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedUpdateNodeData = useCallback(
    debounce((id, data) => updateNodeData(id, data), 500),
    []
  );

  useEffect(() => {
    const listIds = lists.map((list) => list.contact_list_id);
    debouncedUpdateNodeData(props.id, { listIds });
  }, [debouncedUpdateNodeData, lists, props.id]);

  useEffect(() => {
    if (props.data?.listIds && contactLists.length > 0) {
      var lists: any[] = [];

      props.data.listIds.forEach((listId) => {
        lists.push(contactLists.find((c) => c.contact_list_id === listId));
      });
      setLists(lists);
    }
  }, [contactLists, props.data.listIds]);

  return (
    <div className="dark:bg-gray-800 dark:text-white p-4 rounded-lg shadow-lg max-w-sm flex flex-col gap-2">
      <h1 className="text-lg font-semibold">Add to Contact List Node</h1>
      {/* Small note saying that it will rotate around these list, make it more layman for user to understand */}
      <p className="text-sm text-gray-500">
        This node will rotate around these lists, first contact will be added to
        first list, second contact will be added to second list and so on.
      </p>
      <Label htmlFor="listId">List(s)</Label>
      <div className="relative">
        <div className="custom-input flex items-center flex-wrap block w-full border disabled:cursor-not-allowed disabled:opacity-50 bg-gray-50 border-gray-300 text-gray-900 focus:border-cyan-500 focus:ring-cyan-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-cyan-500 dark:focus:ring-cyan-500 p-2.5 text-sm rounded-lg">
          {lists.map((listId, index) => (
            <Badge
              key={listId + index}
              color="info"
              className="mr-2 mb-1 flex items-center">
              {listId.name || listId}
              <span
                className="ml-1 cursor-pointer"
                onClick={() => removeListId(listId)}>
                &times;
              </span>
            </Badge>
          ))}
          <input
            id="listId"
            name="listId"
            placeholder="Enter listId"
            value={listIdInput}
            onChange={handleListIdInputChange}
            onKeyDown={handleListIdKeyPress}
            autoComplete="off"
            className="flex-grow border-none focus:ring-0 focus:outline-none dark:bg-gray-700 bg-gray-50"
          />
        </div>
        {listIdInput && (
          <ul className="absolute left-0 right-0 bg-white border border-gray-200 z-10 max-h-60 overflow-y-auto mt-1 dark:border-gray-800 dark:bg-gray-800">
            {contactLists.map((contactList) => (
              <li
                key={contactList.contact_list_id}
                className="px-4 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => handleContactListClick(contactList)}>
                {contactList.name}
              </li>
            ))}
          </ul>
        )}
      </div>
      <Button
        className="w-full"
        color={"red"}
        onClick={() => {
          removeNode(props.id);
        }}>
        Delete
      </Button>
      <Handle type="target" position={Position.Left} />
      <Handle type="source" position={Position.Right} />
    </div>
  );
}
