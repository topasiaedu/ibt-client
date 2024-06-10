/* eslint-disable jsx-a11y/anchor-is-valid */
import {
  Button,
  Card,
  Datepicker,
  FileInput,
  Label,
  Modal,
  Select,
  TextInput
} from "flowbite-react";
import React, { useState } from "react";
import {
  HiPlus,
} from "react-icons/hi";
import { useAlertContext } from "../../../context/AlertContext";
import { CampaignInsert, useCampaignContext } from "../../../context/CampaignContext";
import { useCampaignPhoneNumberContext } from "../../../context/CampaignPhoneNumberContext";
import { ContactList, useContactListContext } from "../../../context/ContactListContext";
import { usePhoneNumberContext } from "../../../context/PhoneNumberContext";
import { useProjectContext } from "../../../context/ProjectContext";
import { Template, useTemplateContext } from "../../../context/TemplateContext";
import { useWhatsAppBusinessAccountContext } from "../../../context/WhatsAppBusinessAccountContext";
import { supabase } from "../../../utils/supabaseClient";

const AddCampaignModal: React.FC = function () {
  const [isOpen, setIsOpen] = useState(false);
  const { addCampaign, loading } = useCampaignContext();
  const { templates } = useTemplateContext();
  const { contactLists } = useContactListContext();
  const { whatsAppBusinessAccounts } = useWhatsAppBusinessAccountContext();
  const { phoneNumbers } = usePhoneNumberContext();
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [selectedContactList, setSelectedContactList] = useState<ContactList | null>(null);
  const [campaignName, setCampaignName] = useState<string>("");
  const [postDate, setPostDate] = useState<Date>(new Date());
  const [postTime, setPostTime] = useState<string>("");
  const { currentProject } = useProjectContext();
  const { showAlert } = useAlertContext();
  const [selectedWabaPhoneNumber, setSelectedWabaPhoneNumber] = useState<any>([]);
  const { addCampaignPhoneNumber } = useCampaignPhoneNumberContext();
  const [file, setFile] = useState<File | null>(null);

  const wabaPhoneNumber = whatsAppBusinessAccounts.map((waba) => {
    return phoneNumbers.map((phoneNumber) => {
      if (waba.account_id === phoneNumber.waba_id) {
        return {
          waba_id: waba.account_id,
          phone_number_id: phoneNumber.phone_number_id,
          name: waba.name + " - " + phoneNumber.name + " (" + phoneNumber.number + ")",
          quality_rating: phoneNumber.quality_rating,
          id: "waba-" + waba.account_id + "-phone-" + phoneNumber.phone_number_id,
        }
      }
      return null;
    })
  }).flat().filter((item) => item !== null);

  const handleAddCampaign = async () => {
    if (selectedWabaPhoneNumber.length === 0) {
      showAlert("Please select a WhatsApp Business Account and Phone Number", "error");
      return;
    }

    if (!selectedTemplate || !selectedContactList || !campaignName || !postTime) {
      showAlert("Please fill in all the fields", "error");
      return;
    }

    // Assuming postDate is a Date object and postTime is a string in "HH:mm" format
    const combinedDateTimeString = postDate.toISOString().split("T")[0] + "T" + postTime + ":00";

    // // Create a new Date object from the combined date-time string
    // const combinedDateTime = new Date(combinedDateTimeString);

    // // Convert the date-time to the Asia/Kuala_Lumpur timezone offset
    // const kualaLumpurOffset = 8 * 60; // +08:00 in minutes
    // const localOffset = combinedDateTime.getTimezoneOffset(); // Current local timezone offset in minutes

    // // Adjust the combined date-time to Asia/Kuala_Lumpur time
    // const kualaLumpurDateTime = new Date(combinedDateTime.getTime() + (kualaLumpurOffset - localOffset) * 60000);

    // // Format the adjusted date-time to the desired format
    // const formattedDateTime = kualaLumpurDateTime.toISOString().replace('T', ' ').substring(0, 19);

    let template_payload = {
      "name": selectedTemplate?.name,
      "language": {
        "code": selectedTemplate?.language
      },
      "components": []
    } as any;

    if (!selectedTemplate) { showAlert("Please select a template", "error"); return; }
    if (!selectedTemplate?.components) { showAlert("Template has no components", "error"); return; }

    const components = selectedTemplate?.components as any

    for (const [index, component] of components.data.entries()) {
      if (component.example) {
        if (component.type === "HEADER" && component.format === "TEXT") {
          const componentValue = (document.getElementById(selectedTemplate?.template_id.toString() + index) as HTMLInputElement).value;

          template_payload.components.push({
            "type": component.type,
            "parameters": [{
              type: "image",
              "image": {
                "link": componentValue
              }
            }]
          });
        } else if (component.type === "HEADER" && (component.format === "VIDEO" || component.format === "IMAGE")) {
          const randomFileName = Math.random().toString(36).substring(7);
          const { error } = await supabase.storage.from("media").upload(`templates/${randomFileName}`, file!);

          if (error) {
            showAlert("Error uploading file", "error");
            console.error("Error uploading file: ", error);
            return;
          }

          template_payload.components.push({
            "type": component.type,
            "parameters": [{
              type: component.format.toLowerCase(),
              [component.format.toLowerCase()]: {
                "link": `https://yvpvhbgcawvruybkmupv.supabase.co/storage/v1/object/public/media/templates/${randomFileName}`
              }
            }]
          });
        } else if (component.type === "BODY") {
          // const originalMessage = components.data.find((component: any) => component.type === "BODY").text;
          const bodyInputValues = components.data.filter((component: any) => component.type === "BODY").map((component: any) => {
            return component.example.body_text[0].map((body_text: any, index: number) => {
              const DOM = document.getElementById(selectedTemplate.template_id.toString() + index + body_text) as HTMLInputElement;
              if (DOM) {
                return DOM.value;
              } else {
                return body_text;
              }
            })
          }).flat();

          // const replacedMessage = originalMessage.replace(/{{\d}}/g, (match: any) => {
          //   const index = parseInt(match.replace("{{", "").replace("}}", ""));
          //   return bodyInputValues[index - 1];
          // });

          const parameters = bodyInputValues.map((body_text: any) => {
            return {
              "type": "text",
              "text": body_text
            }
          });

          template_payload.components.push({
            "type": component.type,
            "parameters": parameters
          });
        }
      }
    }

    const formData: CampaignInsert = {
      name: campaignName,
      template_id: selectedTemplate?.template_id || 0,
      contact_list_id: selectedContactList?.contact_list_id || 0,
      post_time: combinedDateTimeString,
      template_payload: template_payload,
      status: "PENDING",
      phone_number_id: selectedWabaPhoneNumber[0].phone_number_id,
      project_id: currentProject?.project_id || 5,
    };

    const createdCampaign = await addCampaign(formData);

    if (createdCampaign) {
      // Add the campaign phone number
      selectedWabaPhoneNumber.forEach((item: any) => {
        addCampaignPhoneNumber({
          campaign_id: createdCampaign.campaign_id,
          phone_number_id: item.phone_number_id,
        });
      });
    }

    setIsOpen(false);
    // Set all the fields to default
    setCampaignName("");
    setPostTime("");
    setPostDate(new Date());
    setSelectedTemplate(null);
    setSelectedContactList(null);
    setSelectedWabaPhoneNumber([]);
    showAlert("Campaign created successfully", "success");
  };

  return (
    <>
      <Button color="primary" onClick={() => setIsOpen(true)}>
        <div className="flex items-center gap-x-3">
          <HiPlus className="text-xl" />
          Add Campaign
        </div>
      </Button>
      <Modal onClose={() => setIsOpen(false)} show={isOpen} size={"7xl"}>
        <Modal.Header className="border-b border-gray-200 !p-6 dark:border-gray-700">
          <strong>Add new campaign</strong>
        </Modal.Header>
        <Modal.Body>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="col-span-1">
              <div className="mb-4">
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
              <div className="mb-4">
                <Label htmlFor="waba">Select WhatsApp Business Account & Phone Number</Label>
                <div className="mt-2 grid grid-cols-2 gap-4 sm:grid-cols-2">
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
                {/* Write a small tip saying that if multiple whatsapp business account is selected then they need to ensure that all waba has the template with the same name */}
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Tip: If multiple WhatsApp Business Account is selected, ensure that all WhatsApp Business Account has the template with the same name</p>
              </div>

              <div className="mb-4">
                <Label htmlFor="template">Template</Label>
                <div className="mt-1">
                  <Select
                    id="template"
                    name="template"
                    onChange={(e) => setSelectedTemplate(templates.find((template) => template.template_id === parseInt(e.target.value)) || null)}
                  >
                    <option value="">Select template</option>
                    {templates
                      .filter(template => template.account_id === selectedWabaPhoneNumber.find((selectedItem: any) => selectedItem.waba_id === template.account_id)?.waba_id && template.status === "APPROVED")
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
                    onChange={(e) => setSelectedContactList(contactLists.find((contactList) => contactList.contact_list_id === parseInt(e.target.value)) ?? null)}
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
            </div>
            <div className="col-span-1">
              <div className="mb-4">
                <Label htmlFor="postTime" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Select date:</Label>
                <Datepicker
                  id="postTime"
                  name="postTime"
                  onSelectedDateChanged={(e) => setPostDate(e)}
                />
              </div>
              <div className="mb-4">
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
              {selectedTemplate && selectedTemplate.components && generateTemplateExampleFields(selectedTemplate, selectedTemplate.components, setFile)}
            </div>

            {/* <div className="col-span-1">
              <div className="relative mx-auto border-gray-800 dark:border-gray-800 bg-gray-800 border-[14px] rounded-[2.5rem] h-[600px] w-[300px] shadow-xl">
                <div className="w-[148px] h-[18px] bg-gray-800 top-0 rounded-b-[1rem] left-1/2 -translate-x-1/2 absolute"></div>
                <div className="h-[46px] w-[3px] bg-gray-800 absolute -start-[17px] top-[124px] rounded-s-lg"></div>
                <div className="h-[46px] w-[3px] bg-gray-800 absolute -start-[17px] top-[178px] rounded-s-lg"></div>
                <div className="h-[64px] w-[3px] bg-gray-800 absolute -end-[17px] top-[142px] rounded-e-lg"></div>
                <div className="rounded-[2rem] overflow-hidden w-[272px] h-[572px] bg-white">
                  <div className="p-6">
                    {selectedTemplate && selectedTemplate.components && generatePreview(selectedTemplate, selectedTemplate.components)}
                  </div>
                </div>
              </div>
            </div> */}
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button color="primary" onClick={() => handleAddCampaign()}disabled={loading}>
            Create campaign
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

function generateTemplateExampleFields(selectedTemplate: Template, components: any, setFile: any) {
  return components.data.map((component: any, index: number) => {
    if (component?.example) {
      switch (component.type) {
        case "BODY":
          return (
            <div key={selectedTemplate.template_id.toString() + index} className="mb-4">
              <Label htmlFor={selectedTemplate.template_id.toString() + index}>{component.type}</Label>
              {component.example.body_text[0].map((body_text: any, index: number) => {
                return (
                  <div className="mt-1" key={selectedTemplate.template_id.toString() + index + body_text}>
                    <TextInput
                      id={selectedTemplate.template_id.toString() + index + body_text}
                      name={selectedTemplate.template_id.toString() + index + body_text}
                      placeholder={body_text}
                    />
                  </div>
                )
              })}
            </div>
          )
        case "HEADER":
          return (
            <div key={selectedTemplate.template_id.toString() + index} className="mb-4">
              <Label htmlFor={selectedTemplate.template_id.toString() + index}>{component.type} {component.format}</Label>
              <div className="mt-1">
                <FileInput
                  id={selectedTemplate.template_id.toString() + index}
                  name={selectedTemplate.template_id.toString() + index}
                  placeholder={component.example.header_image}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setFile(file);
                    }
                  }}
                />
                {/* Write a note saying if left empty will reuse the original one */}
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">If left empty, the original {component.format.toLowerCase()} will be used</p>
              </div>
            </div>
          )
        default:
          return null
      }
    } else {
      return null;
    }
  });
}

export default AddCampaignModal;