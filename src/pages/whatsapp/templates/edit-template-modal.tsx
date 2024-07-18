/* eslint-disable jsx-a11y/anchor-is-valid */
import {
  Button,
  Card,
  Label,
  Modal,
  Select,
  Textarea,
  TextInput,
} from "flowbite-react";
import React, { useCallback, useEffect, useState } from "react";
import { HiPlus } from "react-icons/hi";
import MessageComponent from "../../../components/MessageComponent";
import { useProjectContext } from "../../../context/ProjectContext";
import { Template, TemplateButton } from "../../../context/TemplateContext";
import { useWhatsAppBusinessAccountContext } from "../../../context/WhatsAppBusinessAccountContext";

const currentDate = new Date().toLocaleDateString("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  hour: "numeric",
  minute: "numeric",
  second: "numeric",
  hour12: true,
});

interface EditTemplateModalProps {
  template: Template;
}

const EditTemplateModal: React.FC<EditTemplateModalProps> = ({ template }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { whatsAppBusinessAccounts } = useWhatsAppBusinessAccountContext();
  const [buttons, setButtons] = useState<TemplateButton[]>([]);
  const [headerType, setHeaderType] = useState<string>("");
  const [headerData, setHeaderData] = useState<string>("");
  const [bodyData, setBodyData] = useState<string>("");
  const [bodyParams, setBodyParams] = useState<string[]>([]);
  const [footerData, setFooterData] = useState<string>("");
  const { currentProject } = useProjectContext();
  const [preview, setPreview] = useState<JSX.Element | null>(null);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const generatePreview = useCallback(() => {
    const bodyDataMatches = bodyData.match(/{{\d+}}/g);
    let newBodyData = bodyData;

    if (template.name === "je_coaching_july_reminder_2") {
      console.log("bodyDataMatches", bodyData);
    }

    if (bodyDataMatches) {
      bodyDataMatches.forEach((match, index) => {
        newBodyData = newBodyData.replace(
          match,
          bodyParams[index] || index.toString()
        );
      });
    }

    const buttonTexts = buttons.map((button) => button.text) || [];

    let previewContent;
    switch (headerType) {
      case "IMAGE":
        previewContent = (
          <MessageComponent
            message={newBodyData}
            footer={footerData}
            date={currentDate}
            media={headerData}
            buttons={buttonTexts}
            headerType="IMAGE"
          />
        );
        break;
      case "TEXT":
        previewContent = (
          <MessageComponent
            header={headerData}
            message={newBodyData}
            footer={footerData}
            date={currentDate}
            buttons={buttonTexts}
          />
        );
        break;
      case "VIDEO":
        previewContent = (
          <MessageComponent
            message={newBodyData}
            footer={footerData}
            date={currentDate}
            media={headerData}
            buttons={buttonTexts}
            headerType="VIDEO"
          />
        );
        break;
      case "DOCUMENT":
        previewContent = (
          <MessageComponent
            message={newBodyData}
            footer={footerData}
            date={currentDate}
            media={headerData}
            buttons={buttonTexts}
            headerType="DOCUMENT"
          />
        );
        break;
      default:
        previewContent = (
          <MessageComponent
            message={newBodyData}
            footer={footerData}
            date={currentDate}
            buttons={buttonTexts}
          />
        );
    }
    setPreview(previewContent);
  }, [bodyData, buttons, footerData, headerData, headerType]);

  useEffect(() => {
    if (template) {
      const templateComponents = template.components as any;
      const templateComponentsData = templateComponents.data;

      templateComponentsData.forEach((component: any) => {
        switch (component.type) {
          case "HEADER":
            setHeaderType(component.format);
            if (component.format === "IMAGE" && component.example) {
              setHeaderData(component.example.header_handle[0]);
            }
            // setHeaderData(component.headerData);
            break;
          case "BODY":
            setBodyData(component.text);
            if (component.example) {
              setBodyParams(component.example.body_text);
            }
            break;
          case "FOOTER":
            setFooterData(component.text);
            break;
          case "BUTTONS":
            setButtons(component.buttons);
            break;
          default:
            break;
        }
      });

      generatePreview();
    }
  }, [generatePreview, template]);

  return (
    <>
      <Button color="primary" onClick={() => setIsOpen(true)}>
        <div className="flex items-center gap-x-3">
          <HiPlus className="text-xl" />
          Edit Template
        </div>
      </Button>
      <Modal onClose={() => setIsOpen(false)} show={isOpen} size={"7xl"}>
        <Modal.Header className="border-b border-gray-200 !p-6 dark:border-gray-700">
          <strong>Edit new Template</strong>
        </Modal.Header>
        <Modal.Body className="max-h-[calc(100vh-15rem)]">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="col-span-1">
              <div>
                <Label htmlFor="name">Template Name</Label>
                <div className="mt-1">
                  <TextInput
                    id="name"
                    name="name"
                    placeholder="Template name"
                    value={template.name}
                    disabled
                  />
                  {/* Write a small reminder that it cannot have space or capitalized letters */}
                  <p className="text-sm text-gray-500">
                    Template name should not have spaces or capitalized letters
                  </p>
                </div>
              </div>
              <div className="mt-6">
                <Label htmlFor="whatsAppBusinessAccount">
                  WhatsApp Business Account
                </Label>
                <div className="mt-1">
                  <Select
                    disabled
                    id="whatsAppBusinessAccount"
                    name="whatsAppBusinessAccount">
                    <option value="">Select WhatsApp Business Account</option>
                    {whatsAppBusinessAccounts
                      .filter(
                        (whatsAppBusinessAccount) =>
                          whatsAppBusinessAccount.project_id ===
                          currentProject?.project_id
                      )
                      .map((whatsAppBusinessAccount) => (
                        <option
                          key={whatsAppBusinessAccount.account_id}
                          selected={
                            whatsAppBusinessAccount.account_id ===
                            template.account_id
                          }
                          value={whatsAppBusinessAccount.account_id}>
                          {whatsAppBusinessAccount.name}
                        </option>
                      ))}
                  </Select>
                </div>
              </div>

              {/* Category Select: MARKETING, UTILITY,  */}
              <div className="mt-6">
                <Label htmlFor="category">Category</Label>
                <div className="mt-1">
                  <Select id="category" name="category" disabled>
                    <option value="">Select Category</option>
                    <option
                      value="MARKETING"
                      selected={template.category === "MARKETING"}>
                      Marketing
                    </option>
                    <option
                      value="UTILITY"
                      selected={template.category === "UTILITY"}>
                      Utility
                    </option>
                  </Select>
                </div>
              </div>

              {/* Language Select: zh_CN, en_US */}
              <div className="mt-6">
                <Label htmlFor="language">Language</Label>
                <div className="mt-1">
                  <Select id="language" name="language" disabled>
                    <option
                      value="zh_CN"
                      selected={template.language === "zh_CN"}>
                      Chinese
                    </option>
                    <option
                      value="en_US"
                      selected={template.language === "en_US"}>
                      English
                    </option>
                  </Select>
                </div>
              </div>
            </div>
            <div className="col-span-1">
              {/* Header Type */}
              <div>
                <Label htmlFor="headerType">Header Type</Label>
                <div className="mt-1">
                  <Select id="headerType" name="headerType" disabled>
                    <option value="">None</option>
                    <option value="IMAGE" selected={headerType === "IMAGE"}>
                      Image
                    </option>
                    <option value="VIDEO" selected={headerType === "VIDEO"}>
                      Video
                    </option>
                    <option
                      value="DOCUMENT"
                      selected={headerType === "DOCUMENT"}>
                      Document
                    </option>
                    <option value="TEXT" selected={headerType === "TEXT"}>
                      Text
                    </option>
                  </Select>
                </div>
              </div>

              {/* Body */}
              <div className="mt-6">
                <Label htmlFor="body">Body</Label>
                <div className="mt-1">
                  <Textarea
                    disabled
                    id="body"
                    name="body"
                    placeholder="Body"
                    value={bodyData}
                  />
                </div>
              </div>

              {/* Footer */}
              <div className="mt-6">
                <Label htmlFor="footer">
                  Footer{" "}
                  <span className="text-sm text-gray-500">(Optional)</span>
                </Label>
                <div className="mt-1">
                  <TextInput
                    disabled
                    id="footer"
                    name="footer"
                    placeholder="Footer"
                    value={footerData}
                  />
                </div>
              </div>

              {/* Render Button Fields */}
              {buttons.map((button, index) => (
                <Card key={index} className="mt-6">
                  {/* Button Index */}
                  <div className="flex justify-between items-center">
                    <p>
                      Button {index + 1}{" "}
                      <span className="text-sm text-gray-500">
                        ({button.type})
                      </span>
                    </p>
                  </div>
                  <Label htmlFor="buttonText">Button Text</Label>
                  <div className="">
                    <TextInput
                      id="buttonText"
                      name="buttonText"
                      placeholder="Button Text"
                      value={button.text || ""}
                      disabled
                    />
                  </div>
                  {button.type === "URL" && (
                    <>
                      <Label htmlFor="buttonUrl">Button URL</Label>
                      <div className="">
                        <TextInput
                          id="buttonUrl"
                          name="buttonUrl"
                          placeholder="Button URL"
                          value={button.url || ""}
                          disabled
                        />
                      </div>
                    </>
                  )}

                  {/* Place a delete button on the top right corner */}
                </Card>
              ))}
            </div>

            <div className="col-span-1">
              <div className="relative mx-auto border-gray-800 dark:border-gray-800 bg-gray-800 border-[14px] rounded-[2.5rem] h-[600px] w-[300px] shadow-xl ">
                <div className="w-[148px] h-[18px] bg-gray-800 top-0 rounded-b-[1rem] left-1/2 -translate-x-1/2 absolute"></div>
                <div className="h-[46px] w-[3px] bg-gray-800 absolute -start-[17px] top-[124px] rounded-s-lg"></div>
                <div className="h-[46px] w-[3px] bg-gray-800 absolute -start-[17px] top-[178px] rounded-s-lg"></div>
                <div className="h-[64px] w-[3px] bg-gray-800 absolute -end-[17px] top-[142px] rounded-e-lg"></div>
                <div className="rounded-[2rem] overflow-hidden w-[272px] h-[572px] bg-white overflow-y-auto hide-scrollbar">
                  <div className="p-6">{preview}</div>
                </div>
              </div>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button color="primary" onClick={() => setIsOpen(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default EditTemplateModal;
