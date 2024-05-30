import React from 'react';
import { Handle, NodeProps, Position } from 'reactflow';
import { TextInput, Label, Button, Badge } from 'flowbite-react';

export type KeywordData = {
  keywords?: string[]
};

export default function KeywordNode(props: NodeProps<KeywordData>) {
  const [keywords, setKeywords] = React.useState<string[]>(props.data?.keywords ?? []);
  const [ showErrorMessage, setShowErrorMessage ] = React.useState<boolean>(false);
  
  const handleAddKeyword = () => {
    // Add keyword
    const keywordInput = document.getElementById('keyword') as HTMLInputElement;
    const keyword = keywordInput.value;
    if (keyword) {
      // Check if keyword already exists
      if (!keywords.includes(keyword)) {
        setKeywords([...keywords, keyword]);
        keywordInput.value = '';
      } else {
        setShowErrorMessage(true);
        setTimeout(() => {
          setShowErrorMessage(false);
        }, 3000);
      }
    }
  }

  const handleDeleteKeyword = (index: number) => {
    const newKeywords = keywords.filter((keyword, i) => i !== index);
    setKeywords(newKeywords);
  }

  return (
    <div className="dark:bg-gray-800 dark:text-white p-4 rounded-lg shadow-lg">
      <h1 className="text-lg font-semibold">Trigger - Keyword Node</h1>
      <Label className='mt-4'>Keywords</Label>
      {/* Put it in Badges */}
      <div className="flex flex-wrap gap-2 mt-2 max-w-sm">
        {keywords.map((keyword, index) => (
          <Badge key={index} color="primary" className='w-fit' onClick={() => handleDeleteKeyword(index)}>{keyword}</Badge>
        ))}
      </div>
      <Label className='mt-4' htmlFor="keyword">Add new keyword</Label>
      <TextInput id="keyword" name="keyword" placeholder="Enter keyword" />
      {showErrorMessage && <p className="text-red-500 text-sm mt-2">Keyword already exists</p>}
      <Button color="primary" className="mt-4" onClick={handleAddKeyword}>Add keyword</Button>
      <Button color="primary" className="mt-2">Save</Button>
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}