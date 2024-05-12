import React, { DragEvent } from 'react';
import { Sidebar, Card } from 'flowbite-react';

const FlowSidebar: React.FC = () => {
  const onDragStart = (event: DragEvent<HTMLDivElement>, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };
  

  return (
    <Sidebar>
      <Card className="mb-2" onDragStart={(event) => onDragStart(event, 'input')} draggable>
        Input Node
      </Card>
      <Card className="mb-2" onDragStart={(event) => onDragStart(event, 'default')} draggable>
        Default Node
      </Card>
      <Card className="mb-2" onDragStart={(event) => onDragStart(event, 'output')} draggable>
        Output Node
      </Card>

      {/* Triggers */}
      {/* Webhook */}
      <Card className="mb-2" onDragStart={(event) => onDragStart(event, 'counter')} draggable>
        Webhook
      </Card>
      {/* Contact Tag Added */}
      <Card className="mb-2" onDragStart={(event) => onDragStart(event, 'contact-tag-added')} draggable>
        Contact Tag Added
      </Card>
      
    </Sidebar>
  );
};

export default FlowSidebar;
