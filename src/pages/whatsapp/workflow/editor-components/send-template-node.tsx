import debounce from "lodash.debounce";
import React, { useCallback, useEffect, useState } from "react";
import { Handle, NodeProps, Position } from "reactflow";
import {
  Template,
  useTemplateContext,
} from "../../../../context/TemplateContext";
import {
  Label,
  Select,
  Datepicker,
  TextInput,
  Button,
  FileInput,
} from "flowbite-react";
import { useFlowContext } from "../../../../context/FlowContext";
import { supabase } from "../../../../utils/supabaseClient";
import { useAlertContext } from "../../../../context/AlertContext";
import {
  PersonalizedImage,
  usePersonalizedImageContext,
} from "../../../../context/PersonalizedImageContext";

export type SendTemplateData = {
  selectedTemplate?: Template | null;
  templatePayload?: string;
  timePostType?: string;
  postTime?: string;
  postDate?: Date;
  minutesInput?: number;
  mediaUrl?: string;
  personalizedImageId?: string;
  imageType?: string;
};

export default function SendTemplateNode(props: NodeProps<SendTemplateData>) {
  const [timePostType, setTimePostType] = React.useState(
    props.data?.timePostType ?? "immediately"
  );
  const { removeNode, updateNodeData } = useFlowContext();
  const { templates } = useTemplateContext();
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(
    props.data?.selectedTemplate ?? null
  );
  const [postDate, setPostDate] = useState<Date>(new Date());
  const [postTime, setPostTime] = useState<string>("");
  const { showAlert } = useAlertContext();
  const [file, setFile] = useState<File | null>(null);
  const [minutesInput, setMinutesInput] = useState<number>(0);
  const { personalizedImages } = usePersonalizedImageContext();
  const [selectedPersonalizedImage, setSelectedPersonalizedImage] = useState<
    string | undefined
  >(props.data?.personalizedImageId ?? undefined);
  const [imageType, setImageType] = useState<string | undefined>(
    props.data?.imageType ?? undefined
  );

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedUpdateNodeData = useCallback(
    debounce((id, data) => {
      updateNodeData(id, data);
    }, 500),
    []
  );
  const generateTemplatePayload = async (selectedTemplate: Template) => {
    let template_payload = {
      name: selectedTemplate?.name,
      language: {
        code: selectedTemplate?.language,
      },
      components: [],
    } as any;

    if (!selectedTemplate) {
      showAlert("Please select a template", "error");
      return;
    }
    if (!selectedTemplate?.components) {
      showAlert("Template has no components", "error");
      return;
    }

    const components = selectedTemplate?.components as any;

    for (const [index, component] of components.data.entries()) {
      if (component.example) {
        if (component.type === "HEADER" && component.format === "TEXT") {
          const componentValue = (
            document.getElementById(
              selectedTemplate?.template_id.toString() + index
            ) as HTMLInputElement
          ).value;

          template_payload.components.push({
            type: component.type,
            parameters: [
              {
                type: "text",
                text: {
                  body: componentValue,
                },
              },
            ],
          });
        } else if (
          component.type === "HEADER" &&
          (component.format === "VIDEO" || component.format === "IMAGE")
        ) {
          if (file) {
            const randomFileName = Math.random().toString(36).substring(7);
            const { error } = await supabase.storage
              .from("media")
              .upload(`templates/${randomFileName}`, file);

            if (error) {
              showAlert("Error uploading file", "error");
              console.error("Error uploading file: ", error);
              return;
            }

            template_payload.components.push({
              type: component.type,
              parameters: [
                {
                  type: component.format.toLowerCase(),
                  [component.format.toLowerCase()]: {
                    link: `https://yvpvhbgcawvruybkmupv.supabase.co/storage/v1/object/public/media/templates/${randomFileName}`,
                  },
                },
              ],
            });
          } else {
            template_payload.components.push({
              type: component.type,
              parameters: [
                {
                  type: component.format.toLowerCase(),
                  [component.format.toLowerCase()]: {
                    link: component.example.header_handle[0],
                  },
                },
              ],
            });
          }
        } else if (component.type === "BODY") {
          // const originalMessage = components.data.find((component: any) => component.type === "BODY").text;
          const bodyInputValues = components.data
            .filter((component: any) => component.type === "BODY")
            .map((component: any) => {
              return component.example.body_text[0].map(
                (body_text: any, index: number) => {
                  const DOM = document.getElementById(
                    selectedTemplate.template_id.toString() + index + body_text
                  ) as HTMLInputElement;
                  if (DOM) {
                    return DOM.value;
                  } else {
                    return body_text;
                  }
                }
              );
            })
            .flat();

          // const replacedMessage = originalMessage.replace(/{{\d}}/g, (match: any) => {
          //   const index = parseInt(match.replace("{{", "").replace("}}", ""));
          //   return bodyInputValues[index - 1];
          // });

          const parameters = bodyInputValues.map((body_text: any) => {
            return {
              type: "text",
              text: body_text,
            };
          });

          template_payload.components.push({
            type: component.type,
            parameters: parameters,
          });
        }
      }
    }
    return template_payload;
  };

  const updateTemplatePayload = async () => {
    if (selectedTemplate) {
      const template_payload = await generateTemplatePayload(selectedTemplate);
      debouncedUpdateNodeData(props.id, {
        timePostType,
        postTime,
        postDate,
        selectedTemplate,
        minutesInput,
        templatePayload: template_payload,
        personalizedImageId: selectedPersonalizedImage,
        imageType,
      });
    } else if (selectedPersonalizedImage) {
      debouncedUpdateNodeData(props.id, {
        timePostType,
        postTime,
        postDate,
        selectedTemplate,
        minutesInput,
        personalizedImageId: selectedPersonalizedImage,
        imageType,
      });
    }
  };

  useEffect(() => {
    updateTemplatePayload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    timePostType,
    postTime,
    postDate,
    debouncedUpdateNodeData,
    props.id,
    selectedTemplate,
    minutesInput,
    file,
    showAlert,
    selectedPersonalizedImage,
    imageType,
  ]);

  return (
    <div className="dark:bg-gray-800 dark:text-white p-4 rounded-lg shadow-lg max-w-sm flex flex-col gap-2">
      <h1 className="text-lg font-semibold">Send Template Node</h1>
      <Label className="mt-4">Template</Label>
      <Select
        className="mt-2"
        value={selectedTemplate?.template_id ?? ""}
        onChange={(e) =>
          setSelectedTemplate(
            templates.find(
              (template) => template.template_id === parseInt(e.target.value)
            ) || null
          )
        }>
        {templates
          .filter((template) => template.status === "APPROVED")
          .map((template) => (
            <option key={template.template_id} value={template.template_id}>
              {template.name}
            </option>
          ))}
      </Select>
      {selectedTemplate &&
        selectedTemplate.components &&
        generateTemplateExampleFields(
          selectedTemplate,
          selectedTemplate.components,
          setFile,
          updateTemplatePayload,
          personalizedImages,
          selectedPersonalizedImage,
          setSelectedPersonalizedImage,
          imageType,
          setImageType
        )}

      <Label className="mt-4">Time to send</Label>
      <Select
        className="mt-2"
        value={timePostType}
        onChange={(e) => setTimePostType(e.target.value)}>
        <option value="immediately">Immediately</option> {/* Default value */}
        {/* Specific Date Time */}
        <option value="specific_date_time">Specific Date Time</option>
        {/* X minutes after the previous node */}
        <option value="minutes_after">X minutes after the previous node</option>
        {/* X hours after the previous node */}
      </Select>

      {timePostType === "specific_date_time" && (
        <>
          <div className="mb-4">
            <Label
              htmlFor="postTime"
              className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
              Select date:
            </Label>
            <Datepicker
              id="postTime"
              name="postTime"
              value={postDate.toISOString().split("T")[0]}
              onSelectedDateChanged={(e) => {
                setPostDate(e);
              }}
            />
          </div>
          <div className="mb-4">
            <label
              htmlFor="time"
              className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
              Select time:
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 end-0 top-0 flex items-center pe-3.5 pointer-events-none">
                <svg
                  className="w-4 h-4 text-gray-500 dark:text-gray-400"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                  viewBox="0 0 24 24">
                  <path
                    fillRule="evenodd"
                    d="M2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10S2 17.523 2 12Zm11-4a1 1 0 1 0-2 0v4a1 1 0 0 0 .293.707l3 3a1 1 0 0 0 1.414-1.414L13 11.586V8Z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <input
                type="time"
                id="time"
                className="bg-gray-50 border leading-none border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                min="09:00"
                max="18:00"
                value={postTime}
                required
                onChange={(e) => setPostTime(e.target.value)}
              />
            </div>
          </div>
        </>
      )}

      {timePostType === "minutes_after" && (
        <div className="mb-4">
          <Label
            htmlFor="minutes"
            className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
            Minutes after the previous node:
          </Label>
          <TextInput
            id="minutes"
            name="minutes"
            type="number"
            value={minutesInput}
            onChange={(e) => setMinutesInput(parseInt(e.target.value))}
          />
        </div>
      )}
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

function generateTemplateExampleFields(
  selectedTemplate: Template,
  components: any,
  setFile: any,
  updateTemplatePayload: any,
  personalizedImages: PersonalizedImage[],
  selectedPersonalizedImage: string | undefined,
  setPersonalizedImage: any,
  imageType: string | undefined,
  setImageType: any
) {
  return components.data.map((component: any, index: number) => {
    if (component?.example) {
      switch (component.type) {
        case "BODY":
          return (
            <div
              key={selectedTemplate.template_id.toString() + index}
              className="mb-4">
              <Label htmlFor={selectedTemplate.template_id.toString() + index}>
                {component.type}
              </Label>
              {component.example.body_text[0].map(
                (body_text: any, index: number) => {
                  return (
                    <div
                      className="mt-1"
                      key={
                        selectedTemplate.template_id.toString() +
                        index +
                        body_text
                      }>
                      <TextInput
                        id={
                          selectedTemplate.template_id.toString() +
                          index +
                          body_text
                        }
                        name={
                          selectedTemplate.template_id.toString() +
                          index +
                          body_text
                        }
                        placeholder={body_text}
                        onChange={updateTemplatePayload}
                      />
                    </div>
                  );
                }
              )}
            </div>
          );
        case "HEADER":
          return (
            <div
              key={selectedTemplate.template_id.toString() + index}
              className="mb-4">
              <Label htmlFor={selectedTemplate.template_id.toString() + index}>
                {component.type} {component.format}
              </Label>
              <div className="mt-1">
                {component.format === "IMAGE" && (
                  <>
                    {/* Image Type ( generic | personalized) */}
                    <Label
                      htmlFor="imageType"
                      className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                      Image Type:
                    </Label>
                    <Select
                      className="mt-2"
                      value={imageType}
                      onChange={(e) => setImageType(e.target.value)}>
                      <option value="">Select Image Type</option>
                      <option value="generic">Generic</option>
                      <option value="personalized">Personalized</option>
                    </Select>
                    {imageType === "personalized" && (
                      <>
                        <Label
                          htmlFor="personalizedImage"
                          className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                          Personalized Image:
                        </Label>
                        <Select
                          className="mt-2"
                          value={selectedPersonalizedImage}
                          onChange={(e) =>
                            setPersonalizedImage(e.target.value)
                          }>
                          <option value="">Select Personalized Image</option>
                          {personalizedImages.map((image) => (
                            <option key={image.id} value={image.id}>
                              {image.name}
                            </option>
                          ))}
                        </Select>
                      </>
                    )}
                  </>
                )}
                {(imageType === "generic" || component.format === "VIDEO") && (
                  <FileInput
                    id={selectedTemplate.template_id.toString() + index}
                    name={selectedTemplate.template_id.toString() + index}
                    placeholder={component.example.header_image}
                    className="mt-2"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setFile(file);
                      }
                    }}
                  />
                )}
                {/* Write a note saying if left empty will reuse the original one */}
                {/* <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  If left empty, the original {component.format.toLowerCase()}{" "}
                  will be used
                </p> */}
              </div>
            </div>
          );
        default:
          return null;
      }
    } else {
      return null;
    }
  });
}
