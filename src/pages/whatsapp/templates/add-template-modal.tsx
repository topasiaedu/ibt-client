/* eslint-disable jsx-a11y/anchor-is-valid */
import {
  Button,
  Label,
  Modal,
  TextInput,
  Select,
  FileInput,
  Textarea,
  Card,
} from "flowbite-react";
import React, { useCallback, useEffect, useState } from "react";
import { HiPlus } from "react-icons/hi";
import {
  useWhatsAppBusinessAccountContext,
  WhatsAppBusinessAccount,
} from "../../../context/WhatsAppBusinessAccountContext";
import {
  useTemplateContext,
  TemplateInsert,
  TemplateButton,
} from "../../../context/TemplateContext";
import { useProjectContext } from "../../../context/ProjectContext";
import { supabase } from "../../../utils/supabaseClient";
import MessageComponent from "../../../components/MessageComponent";
import { useAlertContext } from "../../../context/AlertContext";

const currentDate = new Date().toLocaleDateString("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  hour: "numeric",
  minute: "numeric",
  second: "numeric",
  hour12: true,
});

const AddTemplateModal: React.FC = function () {
  const [isOpen, setIsOpen] = useState(false);
  const { addTemplate } = useTemplateContext();
  const [selectedWhatsappBusinessAccount, setSelectedWhatsappBusinessAccount] =
    useState<WhatsAppBusinessAccount | null>(null);
  const [templateName, setTemplateName] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [buttons, setButtons] = useState<TemplateButton[]>([]);
  const [headerType, setHeaderType] = useState<string>("");
  const [selectedLanguage, setSelectedLanguage] = useState<string>("");
  const [headerData, setHeaderData] = useState<string>("");
  const [bodyData, setBodyData] = useState<string>("");
  const [footerData, setFooterData] = useState<string>("");
  const [selectedButtonType, setSelectedButtonType] =
    useState<string>("QUICK_REPLY");
  const { currentProject } = useProjectContext();
  const [file, setFile] = useState<File | null>(null);
  const { showAlert } = useAlertContext();
  const [preview, setPreview] = useState<JSX.Element | null>(null);

  const handleAddTemplate = async () => {
    if (selectedCategory === "" || selectedLanguage === "" || !templateName) {
      showAlert("Please fill all the fields", "error");
      return;
    }

    const template: TemplateInsert = {
      account_id: selectedWhatsappBusinessAccount?.account_id ?? null,
      category: selectedCategory,
      components: {},
      language: selectedLanguage,
      name: templateName,
      wa_template_id: null,
      status: "PENDING",
    };

    let components: any[] = [];

    // If footer has data, add it to the components
    if (footerData) {
      components.push({
        type: "FOOTER",
        text: footerData,
      });
    }

    if (buttons.length > 0) {
      components.push({
        type: "BUTTONS",
        buttons: buttons,
      });
    }

    // Check if the body data has any {{1}} or {{2}} or so on, if  so create an example component with this format
    // Where Student is for {{1}}, Teacher is for {{2}} and Parent is for {{3}}
    // "example": {
    //   "body_text": [
    //     [
    //       "Student", "Teacher", "Parent"
    //     ]
    //   ]
    // }
    const bodyDataMatches = bodyData.match(/{{\d+}}/g);
    let example: any = {
      "body_text":[]
    };
    let body_text: string[] = [];

    if (bodyDataMatches) {
      bodyDataMatches.forEach((match) => {
        const domInputValue = (
          document.getElementById(
            `bodyData${parseInt(match.replace(/[{}]/g, "")) - 1}`
          ) as HTMLInputElement
        )?.value;
        body_text.push(domInputValue || "");
      });

      example.body_text.push(body_text);

      components.push({
        type: "BODY",
        text: bodyData,
        example,
      });

    } else {
      components.push({
        type: "BODY",
        text: bodyData,
      });
    }

    if (headerType === "IMAGE" || headerType === "VIDEO") {
      const randomFileName = Math.random().toString(36).substring(7);
      const { error } = await supabase.storage
        .from("media")
        .upload(`templates/${randomFileName}`, file!);

      if (error) {
        console.error("Error uploading file: ", error);
        return;
      }

      components = [
        {
          type: "HEADER",
          format: headerType,
          example: {
            header_handle: [
              `https://yvpvhbgcawvruybkmupv.supabase.co/storage/v1/object/public/media/templates/${randomFileName}`,
            ],
          } as any,
        },
        ...components,
      ];
    } else if (headerType === "TEXT") {
      components = [
        {
          type: "HEADER",
          format: "TEXT",
          text: headerData,
        },
        ...components,
      ];
    }

    // Add components to the template
    template.components = {
      data: components,
    } as any;

    addTemplate(template);
    setIsOpen(false);
    setTemplateName("");
    setSelectedCategory("");
    setSelectedLanguage("");
    setButtons([]);
    setHeaderType("");
    setHeaderData("");
    setBodyData("");
    setFooterData("");
    setSelectedButtonType("QUICK_REPLY");
    setFile(null);
    setPreview(null);
    showAlert("Template added successfully", "success");
  };

  const generatePreview = useCallback(() => {
    // Check if the body data has any {{1}} or {{2}} or so on, replace them with the example data with the appropriate value from the input fields
    const bodyDataMatches = bodyData.match(/{{\d+}}/g);
    let newBodyData = bodyData;
    if (bodyDataMatches) {
      bodyDataMatches.forEach((match) => {
        const domInputValue = (
          document.getElementById(
            `bodyData${parseInt(match.replace(/[{}]/g, "")) - 1}`
          ) as HTMLInputElement
        )?.value;
        newBodyData = newBodyData.replace(match, domInputValue || "");
      });
    }
    const buttonTexts = buttons.map((button) => button.text) || [];
    if (headerType === "IMAGE" && file) {
      return setPreview(
        <MessageComponent
          message={newBodyData}
          footer={footerData}
          date={currentDate}
          media={URL.createObjectURL(file)}
          buttons={buttonTexts}
          headerType="IMAGE"
        />
      );
    } else if (headerType === "TEXT") {
      return setPreview(
        <MessageComponent
          header={headerData}
          message={newBodyData}
          footer={footerData}
          date={currentDate}
          buttons={buttonTexts}
        />
      );
    } else if (headerType === "VIDEO" && file) {
      return setPreview(
        <MessageComponent
          message={newBodyData}
          footer={footerData}
          date={currentDate}
          media={URL.createObjectURL(file)}
          buttons={buttonTexts}
          headerType="VIDEO"
        />
      );
    } else if (headerType === "DOCUMENT") {
      return setPreview(
        <MessageComponent
          message={newBodyData}
          footer={footerData}
          date={currentDate}
          media={headerData}
          buttons={buttonTexts}
          headerType="DOCUMENT"
        />
      );
    } else {
      return setPreview(
        <MessageComponent
          message={newBodyData}
          footer={footerData}
          date={currentDate}
          buttons={buttonTexts}
        />
      );
    }
  }, [bodyData, buttons, file, footerData, headerData, headerType]);

  useEffect(() => {
    generatePreview();
  }, [
    headerData,
    bodyData,
    footerData,
    buttons,
    file,
    headerType,
    generatePreview,
  ]);

  const handleInputChange = (e:any) => {
    const inputValue = e.target.value;
    // Replace spaces and special characters with an empty string
    const sanitizedValue = inputValue.replace(/[^a-z_]/g, '');
    // Set the transformed value to the state
    setTemplateName(sanitizedValue);
  };

  return (
    <>
      <Button color="primary" onClick={() => setIsOpen(true)}>
        <div className="flex items-center gap-x-3">
          <HiPlus className="text-xl" />
          Add Template
        </div>
      </Button>
      <Modal onClose={() => setIsOpen(false)} show={isOpen} size={"7xl"}>
        <Modal.Header className="border-b border-gray-200 !p-6 dark:border-gray-700">
          <strong>Add new Template</strong>
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
                    onChange={(e) => setTemplateName(e.target.value)}
                    value={templateName}
                  />
                  {/* Write a small reminder that it cannot have space or capitalized letters */}
                  <p className="text-sm text-gray-500">
                    Template name should not have spaces or capitalized letters
                  </p>
                </div>
              </div>

              {/* Category Select: MARKETING, UTILITY,  */}
              <div className="mt-6">
                <Label htmlFor="category">Category</Label>
                <div className="mt-1">
                  <Select
                    id="category"
                    name="category"
                    onChange={(e) => setSelectedCategory(e.target.value)}>
                    <option value="">Select Category</option>
                    <option value="MARKETING">Marketing</option>
                    <option value="UTILITY">Utility</option>
                  </Select>
                </div>
              </div>

              {/* Language Select: zh_CN, en_US */}
              <div className="mt-6">
                <Label htmlFor="language">Language</Label>
                <div className="mt-1">
                  <Select
                    id="language"
                    name="language"
                    onChange={(e) => setSelectedLanguage(e.target.value)}>
                    <option value="">Select Language</option>
                    <option value="zh_CN">Chinese</option>
                    <option value="en_US">English</option>
                  </Select>
                </div>
              </div>
            </div>
            <div className="col-span-1">
              {/* Header Type */}
              <div>
                <Label htmlFor="headerType">Header Type</Label>
                <div className="mt-1">
                  <Select
                    id="headerType"
                    name="headerType"
                    onChange={(e) => setHeaderType(e.target.value)}>
                    <option value="">None</option>
                    <option value="IMAGE">Image</option>
                    <option value="VIDEO">Video</option>
                    <option value="DOCUMENT">Document</option>
                    <option value="TEXT">Text</option>
                  </Select>
                </div>
              </div>

              {/* Render Different Fields based on Header Type */}
              {headerType && (
                <div className="mt-6">
                  <Label htmlFor="headerImage">
                    Header {headerType.toLowerCase()}
                  </Label>
                  <div className="mt-1">
                    {headerType !== "TEXT" && headerType && (
                      <FileInput
                        id="headerImage"
                        name="headerImage"
                        onChange={(e) => setFile(e.target.files?.[0] || null)}
                      />
                    )}
                    {headerType === "TEXT" && (
                      <TextInput
                        id="headerText"
                        name="headerText"
                        placeholder="Header Text"
                        onChange={(e) => setHeaderData(e.target.value)}
                      />
                    )}
                  </div>
                </div>
              )}

              {/* Body */}
              <div className="mt-6">
                <Label htmlFor="body">Body</Label>
                <div className="mt-1">
                  <Textarea
                    id="body"
                    name="body"
                    placeholder="Body"
                    onChange={(e) => setBodyData(e.target.value)}
                  />
                </div>
              </div>

              {/* Check body data for {{1}}  or {{2}} and so on and create new Fields for each of them */}
              {bodyData.match(/{{\d+}}/g)?.map((match, index) => (
                <div key={index} className="mt-6">
                  <Label htmlFor={`bodyData${index}`}>{`Body Data ${
                    index + 1
                  }`}</Label>
                  <div className="mt-1">
                    <TextInput
                      id={`bodyData${index}`}
                      name={`bodyData${index}`}
                      onKeyUp={generatePreview}
                      placeholder={`Body Data ${index + 1}`}
                    />
                  </div>
                </div>
              ))}

              {/* Footer */}
              <div className="mt-6">
                <Label htmlFor="footer">
                  Footer{" "}
                  <span className="text-sm text-gray-500">(Optional)</span>
                </Label>
                <div className="mt-1">
                  <TextInput
                    id="footer"
                    name="footer"
                    placeholder="Footer"
                    onChange={(e) => setFooterData(e.target.value)}
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-between items-center">
                <div>
                  <Label htmlFor="buttonType">Button Type</Label>
                  <div className="mt-1">
                    <Select
                      id="buttonType"
                      name="buttonType"
                      onChange={(e) => setSelectedButtonType(e.target.value)}>
                      <option value="">Select Button Type</option>
                      <option value="QUICK_REPLY">Quick Reply</option>
                      <option value="URL">URL</option>
                    </Select>
                  </div>
                </div>

                <div>
                  <Button
                    color="primary"
                    onClick={() => {
                      // Check button type selected
                      // Add button to the list only if the button type is selected an length of buttons is less than 2
                      if (selectedButtonType && buttons.length < 2) {
                        setButtons([
                          ...buttons,
                          {
                            type: selectedButtonType,
                            text: "",
                            url: "",
                            phone_number: "",
                          },
                        ]);
                      }
                    }}>
                    Add Button
                  </Button>
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
                    <Button
                      color="red"
                      onClick={() =>
                        setButtons((prev) => prev.filter((_, i) => i !== index))
                      }>
                      Delete
                    </Button>
                  </div>
                  <Label htmlFor="buttonText">Button Text</Label>
                  <div className="">
                    <TextInput
                      id="buttonText"
                      name="buttonText"
                      placeholder="Button Text"
                      onChange={(e) =>
                        setButtons((prev) =>
                          prev.map((button, i) =>
                            i === index
                              ? { ...button, text: e.target.value }
                              : button
                          )
                        )
                      }
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
                          onChange={(e) =>
                            setButtons((prev) =>
                              prev.map((button, i) =>
                                i === index
                                  ? { ...button, url: e.target.value }
                                  : button
                              )
                            )
                          }
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
          <Button color="primary" onClick={handleAddTemplate}>
            Add Template
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default AddTemplateModal;
