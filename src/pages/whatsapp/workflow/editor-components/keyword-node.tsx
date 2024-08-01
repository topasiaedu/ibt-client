import debounce from "lodash.debounce";
import React, { useCallback, useEffect } from "react";
import { Handle, NodeProps, Position } from "reactflow";
import { Label, Button, Badge } from "flowbite-react";
import { useFlowContext } from "../../../../context/FlowContext";

export type KeywordData = {
  keywords?: string[];
};

export default function KeywordNode(props: NodeProps<KeywordData>) {
  const [keywords, setKeywords] = React.useState<string[]>(
    props.data?.keywords ?? []
  );
  const [keywordInput, setKeywordInput] = React.useState<string>("");
  const { removeNode, updateNodeData } = useFlowContext();

  const removeKeyword = (keyword: string) => {
    console.log("Removing keyword", keyword);
    setKeywords((prev) => prev.filter((c) => c !== keyword));
  };

  const handleKeywordInputChange = (e: { target: { value: any } }) => {
    const value = e.target.value;
    setKeywordInput(value);
  };

  const handleKeywordKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && keywordInput.trim() !== "") {
      setKeywords((prev) => [...prev, keywordInput]);
      setKeywordInput("");
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedUpdateNodeData = useCallback(
    debounce((id, data) => updateNodeData(id, data), 500),
    []
  );

  useEffect(() => {
    debouncedUpdateNodeData(props.id, { keywords });
  }, [keywords, debouncedUpdateNodeData, props.id]);

  return (
    <div className="dark:bg-gray-800 dark:text-white p-4 rounded-lg shadow-lg max-w-sm flex flex-col gap-2">
      <h1 className="text-lg font-semibold">Trigger - Keyword Node</h1>
      <p className="text-sm text-gray-500 dark:text-gray-400">
        Press Enter to add keyword
      </p>
      <div>
        <Label htmlFor="keyword">Keywords</Label>
        <div className="relative">
          <div className="custom-input flex items-center flex-wrap block w-full border disabled:cursor-not-allowed disabled:opacity-50 bg-gray-50 border-gray-300 text-gray-900 focus:border-cyan-500 focus:ring-cyan-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-cyan-500 dark:focus:ring-cyan-500 p-2.5 text-sm rounded-lg">
            {keywords.map((keyword, index) => (
              <div key={keyword + index} className="mr-2 mb-1 flex items-center">
                <Badge color="info" className="flex items-center">
                  {keyword}
                </Badge>
                <button
                  type="button"
                  className="ml-1 cursor-pointer bg-transparent border-none focus:outline-none"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeKeyword(keyword);
                  }}
                  aria-label={`Remove keyword ${keyword}`}>
                  &times;
                </button>
              </div>
            ))}
            <input
              id="keyword"
              name="keyword"
              placeholder="Enter keyword"
              value={keywordInput}
              onChange={handleKeywordInputChange}
              onKeyDown={handleKeywordKeyPress}
              autoComplete="off"
              className="flex-grow border-none focus:ring-0 focus:outline-none dark:bg-gray-700 bg-gray-50"
            />
          </div>
        </div>
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
