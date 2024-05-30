import React, { useState } from 'react';
import { Handle, NodeProps, Position } from 'reactflow';
import { PhoneNumber, usePhoneNumberContext } from '../../../../context/PhoneNumberContext';
import { TextInput, Label, Button, Card } from 'flowbite-react';
import { useWorkflowContext } from '../../../../context/WorkflowContext';
import { useWhatsAppBusinessAccountContext } from '../../../../context/WhatsAppBusinessAccountContext';
import { useProjectContext } from '../../../../context/ProjectContext';
import { useAlertContext } from '../../../../context/AlertContext';

export type WorkflowNodeData = {
  name?: string;
  description?: string;
  id?: string;
  existingPhoneNumbers?: PhoneNumber[];
};

export default function WorkflowNode(props: NodeProps<WorkflowNodeData>) {
  const { createWorkflow, updateWorkflow } = useWorkflowContext();
  const [name, setName] = useState<string>(props.data.name || "");
  const [description, setDescription] = useState<string>(props.data.description || "");
  const id = props.data.id;

  const { whatsAppBusinessAccounts } = useWhatsAppBusinessAccountContext();
  const { currentProject } = useProjectContext();
  const { phoneNumbers } = usePhoneNumberContext();
  const [selectedWabaPhoneNumber, setSelectedWabaPhoneNumber] = useState<any>([]);
  const { showAlert} = useAlertContext();
  const wabaPhoneNumber = whatsAppBusinessAccounts.map((waba) => {
    return phoneNumbers.map((phoneNumber) => {
      if (waba.account_id === phoneNumber.waba_id) {
        return {
          waba_id: waba.account_id,
          phone_number_id: phoneNumber.phone_number_id,
          name: waba.name + " - " + phoneNumber.number,
          quality_rating: phoneNumber.quality_rating,
          id: "waba-" + waba.account_id + "-phone-" + phoneNumber.phone_number_id,
        }
      }
      return null;
    })
  }).flat().filter((item) => item !== null);

  if (props.data.existingPhoneNumbers) {
    wabaPhoneNumber.forEach((item: any) => {
      props.data.existingPhoneNumbers?.forEach((selectedItem: any) => {
        if (item.phone_number_id === selectedItem.phone_number_id) {
          setSelectedWabaPhoneNumber([...selectedWabaPhoneNumber, item]);
        }
      })
    });
  }

  const handleSave = () => {
    if (currentProject === null) { console.error("Current project is null"); return; }
    if (id) {
      // based on selectedWabaPhoneNumber, create an array of PhoneNumber
      const phoneNumbers: PhoneNumber[] = selectedWabaPhoneNumber.map((item: any) => {
        return { phone_number_id: item.phone_number_id }
      });

      updateWorkflow({ id, name, description }, phoneNumbers);
      showAlert("Workflow updated successfully", "success");
    } else {
      // based on selectedWabaPhoneNumber, create an array of PhoneNumber
      const phoneNumbers: PhoneNumber[] = selectedWabaPhoneNumber.map((item: any) => {
        return { phone_number_id: item.phone_number_id }
      });

      createWorkflow({ name, description, id, project_id: currentProject?.project_id }, phoneNumbers);
      showAlert("Workflow created successfully", "success");
    }
  }

  return (
    <div className="dark:bg-gray-800 dark:text-white p-4 rounded-lg shadow-lg">
      <h1 className="text-lg font-semibold">Workflow Node</h1>
      <Label className='mt-4'>Name</Label>
      <TextInput value={name} onChange={(e) => setName(e.target.value)} />
      <Label className='mt-4'>Description</Label>
      <TextInput value={description} onChange={(e) => setDescription(e.target.value)} />

      <Label className='mt-4'>Select WhatsApp Business Account Phone Number</Label>
      <div className="mt-2 grid grid-cols-1 gap-4 sm:grid-cols-1">
        {/* Create Cards that the user can click on to select which phone number to use and use selected wabaPhoneNumber to manage */}
        {wabaPhoneNumber
          // Remove those with UNKNOWN quality_rating
          .filter((item: any) => item && item.quality_rating !== "UNKNOWN")
          .map((item: any, index: number) => (
            <Card key={index} onClick={() => {
              // Use the id of the item to check if it is already in the selectedWabaPhoneNumber
              const exists = selectedWabaPhoneNumber.find((selectedItem: any) => selectedItem.id === item.id);
              if (exists) {
                // Remove the item from the selectedWabaPhoneNumber
                setSelectedWabaPhoneNumber(selectedWabaPhoneNumber.filter((selectedItem: any) => selectedItem.id !== item.id));
              } else {
                // Add the item to the selectedWabaPhoneNumber
                setSelectedWabaPhoneNumber([...selectedWabaPhoneNumber, item]);
              }
            }} className={`cursor-pointer ${selectedWabaPhoneNumber.find((selectedItem: any) => selectedItem.id === item.id) ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white" : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"}`}>
              <div className="flex items-center gap-3">
                <div className="flex flex-col">
                  <span className={`text-sm font-semibold ${selectedWabaPhoneNumber.find((selectedItem: any) => selectedItem.id === item.id) ? "text-white" : "text-gray-900 dark:text-white"}`}>{item.name}</span>
                </div>
              </div>
            </Card>
          ))}
      </div>
      <Button className="mt-4"
        onClick={() => handleSave()}>Save</Button>
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}


