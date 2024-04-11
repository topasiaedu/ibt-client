/* eslint-disable jsx-a11y/anchor-is-valid */
import {
  Button,
  Label,
  Modal,
  TextInput,
  Select,
  Datepicker
} from "flowbite-react";
import React, { useState } from "react";
import {
  HiPlus,
} from "react-icons/hi";
import { CampaignFormData } from "../../../types/campaignTypes";
import { useCampaigns } from "../../../hooks/whatsapp/useCampaign";
import { useTemplates } from "../../../hooks/whatsapp/useTemplate";
import { useContactLists } from "../../../hooks/whatsapp/useContactList";
import { ContactList } from "../../../types/contactListTypes";
import { Template } from "../../../types/templateTypes";
import { WhatsAppBusinessAccount } from "../../../types/whatsappBusinessAccountsTypes";
import { useWhatsappBusinessAccounts } from "../../../hooks/whatsapp/useWhatsappBusinessAccounts";
import { usePhoneNumbers } from "../../../hooks/whatsapp/usePhoneNumber";
import { PhoneNumber } from "../../../types/phoneNumberTypes";

const AddCampaignModal: React.FC = function () {
  const [isOpen, setOpen] = useState(false);
  const { addCampaign } = useCampaigns();
  const { templates } = useTemplates();
  const { contactLists } = useContactLists();
  const { phoneNumbers } = usePhoneNumbers();
  const { whatsappBusinessAccounts } = useWhatsappBusinessAccounts();
  const [selectedWABA, setSelectedWABA] = useState<WhatsAppBusinessAccount>();
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [selectedPhoneNumber, setSelectedPhoneNumber] = useState<PhoneNumber | null>(null);
  const [selectedContactList, setSelectedContactList] = useState<ContactList | null>(null);
  const [campaignName, setCampaignName] = useState<string>("");
  const [postDate, setPostDate] = useState<Date>(new Date());
  const [postTime, setPostTime] = useState<string>("");

  const handleAddCampaign = async () => {

    // Check if all fields are filled
    if (!selectedWABA || !selectedTemplate || !selectedContactList || !campaignName || !postTime) {
      alert("Please fill in all fields");
      return;
    }

    // Combine post date and time to become a single string
    // Date example format: Thu Apr 11 2024 00:00:00 GMT+0800 (Singapore Standard Time)
    // Time example format: 09:00
    // Post date and time example format: 2024-04-11 09:00
    const combinedDateTime = postDate.toISOString().split("T")[0] + " " + postTime;

    let template_payload = {
      "name": selectedTemplate?.name,
      "language": {
        "code": selectedTemplate?.language
      },
      "components": []
    } as any;

    selectedTemplate?.components.data.forEach((component: any, index: number) => {
      if (component.example) {
        const componentValue = (document.getElementById(selectedTemplate?.template_id.toString() + index) as HTMLInputElement).value;

        if (component.type === "HEADER" && component.format === "IMAGE") {
          template_payload.components.push({
            "type": component.type,
            "parameters": [{
              type: "image",
              "image": {
                "link": componentValue
              }
            }]
          });
        } else {
          template_payload.components.push({
            "type": component.type,
            "parameters": [{
              type: "text",
              "text": componentValue
            }]
          });
        }
      }
    });

    const formData: CampaignFormData = {
      name: campaignName,
      template_id: selectedTemplate?.template_id || 0,
      contact_list_id: selectedContactList?.contact_list_id || 0,
      post_time: combinedDateTime,
      template_payload: template_payload,
      status: "PENDING",
      phone_number_id: selectedPhoneNumber?.phone_number_id || 0
    };
    await addCampaign(formData);
    // setOpen(false);
    // Reload the page to reflect the changes
    window.location.reload();
  };

  return (
    <>
      <Button color="primary" onClick={() => setOpen(true)}>
        <div className="flex items-center gap-x-3">
          <HiPlus className="text-xl" />
          Add Campaign
        </div>
      </Button>
      <Modal onClose={() => setOpen(false)} show={isOpen}>
        <Modal.Header className="border-b border-gray-200 !p-6 dark:border-gray-700">
          <strong>Add new campaign</strong>
        </Modal.Header>
        <Modal.Body>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <Label htmlFor="name">Name</Label>
              <div className="mt-1">
                <TextInput
                  id="name"
                  name="name"
                  placeholder="Campaign name"
                  onChange={(e) => setCampaignName(e.target.value)}
                  value={campaignName}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="waba">WhatsApp Business Account</Label>
              <div className="mt-1">
                <Select
                  id="waba"
                  name="waba"
                  onChange={(e) => setSelectedWABA(whatsappBusinessAccounts.find((waba) => waba.account_id === parseInt(e.target.value)) || undefined)}
                >
                  <option value="">Select WhatsApp Business Account</option>
                  {whatsappBusinessAccounts.map((waba) => (
                    <option key={waba.account_id} value={waba.account_id}>
                      {waba.name}
                    </option>
                  ))}
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="phoneNumber">Phone Number</Label>
              <div className="mt-1">
                <Select
                  id="phoneNumber"
                  name="phoneNumber"
                  onChange={(e) => setSelectedPhoneNumber(phoneNumbers.find((phoneNumber) => phoneNumber.phone_number_id === parseInt(e.target.value)) || null)}
                >
                  <option value="">Select phone number</option>
                  {phoneNumbers
                    .filter(phoneNumber => phoneNumber.whatsapp_business_accounts.account_id === selectedWABA?.account_id)
                    .map((phoneNumber) => (
                      <option key={phoneNumber.phone_number_id} value={phoneNumber.phone_number_id}>
                        {phoneNumber.number}
                      </option>
                    ))}
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="template">Template</Label>
              <div className="mt-1">
                <Select
                  id="template"
                  name="template"
                  onChange={(e) => setSelectedTemplate(templates.find((template) => template.template_id === parseInt(e.target.value)) || null)}
                >
                  <option value="">Select template</option>
                  {templates
                    .filter(template => template.whatsapp_business_accounts.account_id === selectedWABA?.account_id)
                    .map((template) => (
                      <option key={template.template_id} value={template.template_id}>
                        {template.name}
                      </option>
                    ))}
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="contactList">Contact List</Label>
              <div className="mt-1">
                <Select
                  id="contactList"
                  name="contactList"
                  onChange={(e) => setSelectedContactList(contactLists.find((contactList) => contactList.contact_list_id === parseInt(e.target.value)) || null)}
                >
                  <option value="">Select contact list</option>
                  {contactLists.map((contactList) => (
                    <option key={contactList.contact_list_id} value={contactList.contact_list_id}>
                      {contactList.name}
                    </option>
                  ))}
                </Select>
              </div>
            </div>
            <div className="mt-1">
              <Label htmlFor="postTime" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Select date:</Label>
              <Datepicker
                id="postTime"
                name="postTime"
                onSelectedDateChanged={(e) => setPostDate(e)}
              />
            </div>
            <div>
              <label htmlFor="time" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Select time:</label>
              <div className="relative">
                <div className="absolute inset-y-0 end-0 top-0 flex items-center pe-3.5 pointer-events-none">
                  <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
                    <path fillRule="evenodd" d="M2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10S2 17.523 2 12Zm11-4a1 1 0 1 0-2 0v4a1 1 0 0 0 .293.707l3 3a1 1 0 0 0 1.414-1.414L13 11.586V8Z" clipRule="evenodd" />
                  </svg>
                </div>
                <input type="time" id="time" className="bg-gray-50 border leading-none border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" min="09:00" max="18:00" value={postTime} required
                  onChange={(e) => setPostTime(e.target.value)}
                />
              </div>
            </div>
            {selectedTemplate && selectedTemplate.components.data.map((component: any, index: number) => {
              if (component.example) {
                let placeholder = "";

                if (component.type === "HEADER" && component.format === "IMAGE") {
                  placeholder = component.example.header_handle || "";
                } else {
                  placeholder = component.example.body_text || "";
                }
                return (
                  <div key={selectedTemplate.template_id.toString() + index}>
                    <Label htmlFor={selectedTemplate.template_id.toString() + index}>{component.type}</Label>
                    <div className="mt-1">
                      <TextInput
                        id={selectedTemplate.template_id.toString() + index}
                        name={selectedTemplate.template_id.toString() + index}
                        placeholder={placeholder}
                      />
                    </div>
                  </div>
                )
              } else {
                return null;
              }
            })}
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button color="primary" onClick={() => handleAddCampaign()}>
            Create campaign
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default AddCampaignModal;