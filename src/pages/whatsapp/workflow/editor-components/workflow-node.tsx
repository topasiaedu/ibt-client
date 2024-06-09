import debounce from 'lodash.debounce';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Handle, NodeProps, Position } from 'reactflow';
import { PhoneNumber, usePhoneNumberContext } from '../../../../context/PhoneNumberContext';
import { TextInput, Label, Card } from 'flowbite-react';
import { useWhatsAppBusinessAccountContext } from '../../../../context/WhatsAppBusinessAccountContext';
import { useFlowContext } from '../../../../context/FlowContext';
import isEqual from 'lodash.isequal';

export type WorkflowNodeData = {
  name?: string;
  description?: string;
  id?: string;
  existingPhoneNumbers?: PhoneNumber[];
  phone_numbers?: PhoneNumber[];
};

export default function WorkflowNode(props: NodeProps<WorkflowNodeData>) {
  const [name, setName] = useState<string>(props.data.name || "");
  const [description, setDescription] = useState<string>(props.data.description || "");
  const { whatsAppBusinessAccounts } = useWhatsAppBusinessAccountContext();
  const { phoneNumbers } = usePhoneNumberContext();
  const [selectedWabaPhoneNumber, setSelectedWabaPhoneNumber] = useState<any>([]);
  const { updateNodeData } = useFlowContext();

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

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedUpdateNodeData = useCallback(
    debounce((id, data) => updateNodeData(id, data), 500),
    []
  );

  const useDeepCompareEffect = (effect: React.EffectCallback, dependencies: any[]) => {
    const previousDependenciesRef = useRef<any[]>([]);
  
    if (!isEqual(previousDependenciesRef.current, dependencies)) {
      previousDependenciesRef.current = dependencies;
    }
  
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(effect, [previousDependenciesRef.current]);
  };
  

  useDeepCompareEffect(() => {
    const updateSelectedWabaPhoneNumbers = () => {
      if (props.data?.phone_numbers) {
        const newSelectedWabaPhoneNumbers = wabaPhoneNumber.filter((item: any) =>
          props.data.phone_numbers?.some((selectedItem: any) => {
            return item.phone_number_id === selectedItem.phone_number_id
          })
        );
        setSelectedWabaPhoneNumber(newSelectedWabaPhoneNumbers);
      }
    };

    updateSelectedWabaPhoneNumbers();
  }, [props.data?.phone_numbers, wabaPhoneNumber]);
  useEffect(() => {
    debouncedUpdateNodeData(props.id, { name, description, phone_numbers: selectedWabaPhoneNumber });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name, description, selectedWabaPhoneNumber]);

  return (
    <div className="dark:bg-gray-800 dark:text-white p-4 rounded-lg shadow-lg max-w-sm">
      <h1 className="text-lg font-semibold">Workflow Node</h1>
      {/* Write a helper text saying that we only support one trigger for now */}
      <p className="text-sm mt-2 text-gray-500">
        At the moment, we only support one trigger per workflow. We will add support for multiple triggers in the future.
      </p>
      <div className="flex flex-col gap-4">
        <div>
          <Label className='mt-4'>Name</Label>
          <TextInput value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div>
          <Label className='mt-4'>Description</Label>
          <TextInput value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>
        <div>
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
        </div>
      </div>
      {/* <Button className="mt-4"        onClick={() => handleSave()}>Save</Button> */}
      <Handle type="source" position={Position.Right} />
    </div>
  );
}


