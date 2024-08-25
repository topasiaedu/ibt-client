import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { FabricJSCanvas, useFabricJSEditor } from "fabricjs-react";
import {
  Button,
  Card,
  Label,
  TextInput,
  Select,
  RangeSlider,
} from "flowbite-react";
import * as fabric from "fabric";
import NavbarSidebarLayout from "../../layouts/navbar-sidebar";
import {
  PersonalizedImageUpdate,
  usePersonalizedImageContext,
} from "../../context/PersonalizedImageContext";
import { useAlertContext } from "../../context/AlertContext";
import { useProjectContext } from "../../context/ProjectContext";
import { supabase } from "../../utils/supabaseClient";

const CanvasEditor: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const { editor, onReady } = useFabricJSEditor();
  const [selectedObject, setSelectedObject] = useState<fabric.Object | null>(
    null
  );
  const { addPersonalizedImage, updatePersonalizedImage, personalizedImages } =
    usePersonalizedImageContext();
  const [name, setName] = useState<string>("");
  const { showAlert } = useAlertContext();
  const { currentProject } = useProjectContext();

  useEffect(() => {
    if (id && editor) {
      const personalizedImage = personalizedImages.find(
        (image) => image.id === id
      );
      if (personalizedImage) {
        setName(personalizedImage.name);

        editor.canvas.loadFromJSON(
          JSON.parse(personalizedImage.canvas_state),
          () => {
            // Render after loading JSON
            setTimeout(() => {
              editor.canvas.renderAll();

              // Optionally trigger an object selection to force a redraw
              const objects = editor.canvas.getObjects();
              if (objects.length > 0) {
                editor.canvas.setActiveObject(objects[0]);
                editor.canvas.discardActiveObject();
              }
            }, 50); // Small delay to ensure everything is ready
          }
        );
      }
    }
  }, [id, editor, personalizedImages]);

  const onSaveCanvas = async () => {
    if (!editor || !currentProject) return;

    try {
      // Step 1: Generate the image from the canvas
      const canvasDataURL = editor.canvas.toDataURL({
        format: "png",
        quality: 1.0,
        multiplier: 2,
      });

      // Convert the base64 string to a Blob
      const byteString = atob(canvasDataURL.split(",")[1]);
      const mimeString = canvasDataURL
        .split(",")[0]
        .split(":")[1]
        .split(";")[0];
      const arrayBuffer = new ArrayBuffer(byteString.length);
      const uint8Array = new Uint8Array(arrayBuffer);

      for (let i = 0; i < byteString.length; i++) {
        uint8Array[i] = byteString.charCodeAt(i);
      }

      const blob = new Blob([uint8Array], { type: mimeString });

      const randomFileName = Math.random().toString(36).substring(7);

      // Step 2: Upload the image to Supabase
      const { error: uploadError } = await supabase.storage
        .from("media")
        .upload(`templates/${randomFileName}.png`, blob, {
          contentType: "image/png",
          upsert: true,
        });

      if (uploadError) {
        throw new Error(
          "Error uploading image to Supabase: " + uploadError.message
        );
      }

      // Step 3: Prepare the data for saving
      const canvasState = JSON.stringify(editor.canvas.toJSON());

      // Step 4: Save the data
      const mediaUrl = `https://yvpvhbgcawvruybkmupv.supabase.co/storage/v1/object/public/media/templates/${randomFileName}.png`;

      if (id) {
        const data: PersonalizedImageUpdate = {
          id,
          name,
          canvas_state: canvasState,
          project_id: currentProject.project_id,
          media_url: mediaUrl,
        };

        await updatePersonalizedImage(data);
        showAlert("Personalized image updated successfully.", "success");
      } else {
        const data = {
          name,
          canvas_state: canvasState,
          project_id: currentProject.project_id,
          media_url: mediaUrl,
        };
        await addPersonalizedImage(data);
        showAlert("Personalized image created successfully.", "success");
      }
    } catch (error) {
      console.error("Error saving personalized image:", error);
      showAlert(
        "An error occurred while saving the personalized image.",
        "error"
      );
    }
  };

  const onAddText = () => {
    if (editor) {
      const text = new fabric.Textbox("Enter text", {
        left: 100,
        top: 100,
        fontFamily: "Arial", // Default font family
        fontSize: 20,
        fontWeight: "normal",
        fontStyle: "normal",
        underline: false,
      });
      editor.canvas.add(text);
      editor.canvas.setActiveObject(text);
    }
  };

  const onAddRectangle = () => {
    if (editor) {
      const rectangle = new fabric.Rect({
        left: 100,
        top: 100,
        width: 100,
        height: 100,
        fill: "red",
      });
      editor.canvas.add(rectangle);
      editor.canvas.setActiveObject(rectangle); 
    }
  };

  const onAddImage = async () => {
    if (editor) {
      const url = prompt("Enter the image URL:");
      if (url) {
        const img = fabric.FabricImage.fromURL(url, {
          crossOrigin: "anonymous",
        });
        editor.canvas.add(await img);
      }
    }
  };

  const handleObjectSelection = (e: any) => {
    const target = e.selected[0];

    if (target) {
      console.log("Object selected:", target);
      console.log("Object type:", target.type); // Log the object type
      setSelectedObject(target);
    } else {
      console.error("Selected object is undefined or null.", e);
    }
  };
  const handleDeselectObject = () => {
    setSelectedObject(null);
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const handleSaveCanvasState = () => {
    if (editor) {
      const canvasJSON = editor.canvas.toJSON();
      console.log(canvasJSON); // Assuming you want to see the JSON for debugging
    }
  };

  const updateSelectedObject = (property: string, value: any) => {
    if (selectedObject) {
      // Directly update the object's property
      selectedObject.set(property, value);

      // Force the canvas to re-render the changes
      editor?.canvas.renderAll();

      // Trigger a state update with the same object reference
      setSelectedObject(selectedObject);
      console.log("Updated selectedObject:", selectedObject);
    }
  };
  

  const renderPropertiesPanel = () => {
    if (!selectedObject) {
      return <p>Select an element to edit its properties.</p>;
    }

    console.log("Rendering properties for:", selectedObject.type);

    switch (selectedObject.type) {
      case "textbox":
        return (
          <div className="flex flex-col space-y-4">
            <div>
              <Label htmlFor="fontFamily" value="Font Family:" />
              <Select
                id="fontFamily"
                value={(selectedObject as fabric.Textbox).fontFamily || "Arial"}
                onChange={(e) =>
                  updateSelectedObject("fontFamily", e.target.value)
                }>
                <option value="Arial">Arial</option>
                <option value="Helvetica">Helvetica</option>
                <option value="Times New Roman">Times New Roman</option>
                <option value="Courier New">Courier New</option>
                <option value="Verdana">Verdana</option>
                <option value="Georgia">Georgia</option>
                <option value="Palatino">Palatino</option>
                <option value="Garamond">Garamond</option>
                <option value="Bookman">Bookman</option>
                <option value="Comic Sans MS">Comic Sans MS</option>
                <option value="Trebuchet MS">Trebuchet MS</option>
                <option value="Arial Black">Arial Black</option>
                <option value="Impact">Impact</option>
              </Select>
            </div>
            <div>
              <Label htmlFor="fontColor" value="Font Color:" />
              <TextInput
                id="fontColor"
                type="color"
                value={
                  ((selectedObject as fabric.Textbox).fill as string) ||
                  "#000000"
                }
                onChange={(e) => updateSelectedObject("fill", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="textAlign" value="Text Align:" />
              <Select
                id="textAlign"
                value={(selectedObject as fabric.Textbox).textAlign || "left"}
                onChange={(e) =>
                  updateSelectedObject("textAlign", e.target.value)
                }>
                <option value="left">Left</option>
                <option value="center">Center</option>
                <option value="right">Right</option>
              </Select>
            </div>
            <div className="flex space-x-2">
              <Button
                size="sm"
                onClick={() =>
                  updateSelectedObject(
                    "fontWeight",
                    (selectedObject as fabric.Textbox).fontWeight === "bold"
                      ? "normal"
                      : "bold"
                  )
                }>
                {(selectedObject as fabric.Textbox).fontWeight === "bold"
                  ? "Unbold"
                  : "Bold"}
              </Button>
              <Button
                size="sm"
                onClick={() =>
                  updateSelectedObject(
                    "fontStyle",
                    (selectedObject as fabric.Textbox).fontStyle === "italic"
                      ? "normal"
                      : "italic"
                  )
                }>
                {(selectedObject as fabric.Textbox).fontStyle === "italic"
                  ? "Unitalic"
                  : "Italic"}
              </Button>
              <Button
                size="sm"
                onClick={() =>
                  updateSelectedObject(
                    "underline",
                    !(selectedObject as fabric.Textbox).underline
                  )
                }>
                {(selectedObject as fabric.Textbox).underline
                  ? "Remove Underline"
                  : "Underline"}
              </Button>
            </div>
          </div>
        );

      case "rect":
        return (
          <div className="flex flex-col space-y-4">
            {/* <div className="mt-4">
              <Label htmlFor="width" value="Width:" />
              <TextInput
                id="width"
                type="number"
                value={selectedObject.width || 100}
                onChange={(e) =>
                  updateSelectedObject("width", parseInt(e.target.value))
                }
              />
            </div>
            <div className="mt-4">
              <Label htmlFor="height" value="Height:" />
              <TextInput
                id="height"
                type="number"
                value={selectedObject.height || 100}
                onChange={(e) =>
                  updateSelectedObject("height", parseInt(e.target.value))
                }
              />
            </div> */}
            <div>
              <Label htmlFor="fillColor" value="Fill Color:" />
              <TextInput
                id="fillColor"
                type="color"
                value={(selectedObject.fill as string) || "#ff0000"}
                onChange={(e) => updateSelectedObject("fill", e.target.value)}
              />
            </div>
          </div>
        );
      case "image":
        return (
          <div className="flex flex-col space-y-4">
            <Label htmlFor="opacity" value="Opacity:" />
            <RangeSlider
              id="opacity"
              min={0}
              max={1}
              step={0.1}
              value={(selectedObject.opacity as number) || 1}
              onChange={(e) =>
                updateSelectedObject("opacity", parseFloat(e.target.value))
              }
            />
          </div>
        );
      default:
        return <p>Properties not available for this element.</p>;
    }
  };

  useEffect(() => {
    if (editor) {
      editor.canvas.on("selection:created", handleObjectSelection);
      editor.canvas.on("selection:updated", handleObjectSelection);
      editor.canvas.on("selection:cleared", handleDeselectObject);
      editor.canvas.on("object:added", handleSaveCanvasState);
      editor.canvas.on("object:modified", handleSaveCanvasState);
    }
    return () => {
      if (editor) {
        editor.canvas.off("selection:created", handleObjectSelection);
        editor.canvas.off("selection:updated", handleObjectSelection);
        editor.canvas.off("selection:cleared", handleDeselectObject);
        editor.canvas.off("object:added", handleSaveCanvasState);
        editor.canvas.off("object:modified", handleSaveCanvasState);
      }
    };
  }, [editor, handleSaveCanvasState]);

  // Move object forward
  const moveObjectForward = () => {
    if (selectedObject && editor) {
      const objects = editor.canvas.getObjects();
      const index = objects.indexOf(selectedObject);

      // Ensure the object is not already at the top
      if (index < objects.length - 1) {
        // Manually move the object forward
        objects.splice(index, 1);
        objects.splice(index + 1, 0, selectedObject);
        editor.canvas._objects = objects;
        editor.canvas.renderAll(); // Re-render the canvas to apply changes
      }
    }
  };

  // Move object backward
  const moveObjectBackward = () => {
    if (selectedObject && editor) {
      const objects = editor.canvas.getObjects();
      const index = objects.indexOf(selectedObject);
      console.log("Index:", index);
      // Ensure the object is not already at the bottom
      if (index > 0) {
        // Manually move the object backward
        objects.splice(index, 1);
        objects.splice(index - 1, 0, selectedObject);
        console.log("Objects:", objects);
        editor.canvas._objects = objects;
        editor.canvas.renderAll(); // Re-render the canvas to apply changes
      }
    }
  };

  return (
    <NavbarSidebarLayout>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 h-[87vh] p-4">
        <div className="lg:col-span-1 overflow-y-auto hide-scrollbar">
          <Card>
            <h3 className="text-xl font-semibold">Image Details:</h3>

            <div className="mt-4">
              <Label htmlFor="name" value="Name:" />
              <TextInput
                id="name"
                placeholder="Enter name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <h5 className="mt-4 text-lg font-medium">Elements</h5>
            <div className="space-y-2 flex flex-col">
              <Button onClick={onAddText} size="sm" color="light">
                <i className="fas fa-font mr-2"></i>
                Text
              </Button>
              <Button onClick={onAddRectangle} size="sm" color="light">
                <i className="fas fa-square mr-2"></i>
                Rectangle
              </Button>
              <Button onClick={onAddImage} size="sm" color="light">
                <i className="fas fa-image mr-2"></i>
                Image
              </Button>
            </div>

            <h5 className="mt-6 text-lg font-medium">Edit Element</h5>
            <div id="properties-panel" className="space-y-2">
              {renderPropertiesPanel()}
            </div>

            {/* <div className="mt-6 flex space-x-2">
              <Button id="undo" size="sm" color="gray">
                Undo
              </Button>
              <Button id="redo" size="sm" color="gray">
                Redo
              </Button>
            </div> */}

            {selectedObject && (
              <div className="mt-6 flex space-x-2">
                <Button
                  size="sm"
                  color="gray"
                  onClick={() => {
                    if (selectedObject) {
                      moveObjectForward();
                    }
                  }}>
                  Bring Forward
                </Button>
                <Button
                  size="sm"
                  color="gray"
                  onClick={() => {
                    if (selectedObject) {
                      moveObjectBackward();
                    }
                  }}>
                  Send Backward
                </Button>
                <Button
                  size="sm"
                  color="red"
                  onClick={() => {
                    if (selectedObject) {
                      editor?.canvas.remove(selectedObject);
                      setSelectedObject(null); // Clear the selection after deletion
                    }
                  }}>
                  Delete
                </Button>
              </div>
            )}

            <div className="mt-6 flex justify-between">
              <Button
                size="sm"
                color="dark"
                onClick={() => window.history.back()}>
                Back
              </Button>
              <Button size="sm" color="primary" onClick={onSaveCanvas}>
                <i className="fal fa-paper-plane mr-2"></i>
                Save
              </Button>
            </div>
          </Card>
        </div>

        <div className="lg:col-span-3 flex justify-center items-center bg-gray-100 dark:bg-gray-800">
          <FabricJSCanvas
            className="border border-gray-300 bg-white dark:bg-gray-900 shadow-md rounded-lg w-[500px] h-[500px]"
            onReady={onReady}
          />
        </div>
      </div>
    </NavbarSidebarLayout>
  );
};

export default CanvasEditor;
