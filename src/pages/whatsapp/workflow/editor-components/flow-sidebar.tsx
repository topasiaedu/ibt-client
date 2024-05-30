import React, { DragEvent, useCallback } from 'react';
import { Button, Card } from 'flowbite-react';
import { useFlowContext } from '../../../../context/FlowContext';

const FlowSidebar: React.FC = () => {
  const onDragStart = useCallback((event: DragEvent<HTMLDivElement>, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  }, []);
  const {saveWorkflow} = useFlowContext();

  return (
    <div className="p-4">

      <Button color="primary" className="w-full mb-4" onClick={saveWorkflow}>
        Save Workflow & Close
      </Button>

      <h1 className="text-lg font-bold mb-4">Triggers</h1>
      {/* <Card className="mb-2 p-0" onDragStart={(event) => onDragStart(event, 'contact-added-to-contact-list')} draggable>
        Contact Added to Contact List
      </Card> */}

      {/* <Card className="mb-2" onDragStart={(event) => onDragStart(event, 'contact-tag-added')} draggable>
        Contact Tag Added
      </Card> */}

      <Card className="mb-2 p-0" onDragStart={(event) => onDragStart(event, 'webhook')} draggable>
        Webhook
      </Card>

      <Card className="mb-2 p-0" onDragStart={(event) => onDragStart(event, 'keyword')} draggable>
        Keyword
      </Card>

      <h1 className="text-lg font-bold mb-4">Actions</h1>
      <Card className="mb-2 p-0" onDragStart={(event) => onDragStart(event, 'send-template')} draggable>
        Send Template
      </Card>

      <Card className="mb-2 p-0" onDragStart={(event) => onDragStart(event, 'send-message')} draggable>
        Send Message
      </Card>

      {/* <Card className="mb-2 p-0" onDragStart={(event) => onDragStart(event, 'delay')} draggable>
        Delay
      </Card> */}

      {/* Add to contact list */}
      <Card className="mb-2 p-0" onDragStart={(event) => onDragStart(event, 'add-to-contact-list')} draggable>
        Add to Contact List
      </Card>
    </div>
  );
};

export default React.memo(FlowSidebar);
