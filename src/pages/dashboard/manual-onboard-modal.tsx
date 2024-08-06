/* eslint-disable react/style-prop-object */
import { Button, Label, Modal, Tabs, TextInput } from "flowbite-react";
import React, { useState } from "react";
import { MdCloudUpload } from "react-icons/md";
import { Textarea } from "flowbite-react";
import { useAlertContext } from "../../context/AlertContext";
import { CgProfile } from "react-icons/cg";
import { IoPeopleCircleOutline } from "react-icons/io5";

const ManualOnboardVIPModal: React.FC = () => {
  const [isOpen, setOpen] = useState(false);
  const [formInput, setFormInput] = useState("");
  const { showAlert } = useAlertContext();
  const [email, setEmail] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [name, setName] = useState<string>("");

  const handleOnboard = () => {
    if (formInput) {
      const lines = formInput.split("\n");
      lines.forEach((line) => {
        const [phone, name, email] = line.split(",");
        sendRequest({ name, email, phone });
      });
    } else {
      sendRequest({ name, email, phone });
    }
  };

  const sendRequest = async (data: { name: string; email: string; phone: string }) => {
    try {
      const response = await fetch("https://ibts3.whatsgenie.com/pemni/vip", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        showAlert("VIP onboard successfully", "success");
        setOpen(false);
      } else {
        showAlert("Failed to onboard VIP", "error");
      }
    } catch (error) {
      showAlert("Failed to onboard VIP", "error");
    }
  };
  

  return (
    <>
      <Button color="primary" onClick={() => setOpen(true)}>
        <div className="flex items-center gap-x-2">
          <MdCloudUpload className="text-xs" />
          Manual Onboard VIP
        </div>
      </Button>
      <Modal onClose={() => setOpen(false)} show={isOpen}>
        <Modal.Header className="border-b border-gray-200 !p-6 dark:border-gray-700">
          <strong>Manual Onboard VIP</strong>
        </Modal.Header>
        <Modal.Body>
          <div className="overflow-x-auto">
            <Tabs aria-label="Full width tabs" style="fullWidth">
              <Tabs.Item active title="Individual" icon={CgProfile}>
                <div className="mb-4">
                  <Label htmlFor="name">Name</Label>
                  <div className="mt-1">
                    <TextInput
                      id="name"
                      name="name"
                      placeholder="Name"
                      onChange={(e) => setName(e.target.value)}
                      value={name}
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <Label htmlFor="email">Email</Label>
                  <div className="mt-1">
                    <TextInput
                      id="email"
                      name="email"
                      placeholder="Email"
                      onChange={(e) => setEmail(e.target.value)}
                      value={email}
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <Label htmlFor="phone">Phone</Label>
                  <div className="mt-1">
                    <TextInput
                      id="phone"
                      name="phone"
                      placeholder="Phone"
                      onChange={(e) => setPhone(e.target.value)}
                      value={phone}
                    />
                  </div>
                </div>
              </Tabs.Item>
              <Tabs.Item title="Batch" icon={IoPeopleCircleOutline}>
                {/* Helper Text to remind for the format */}
                <div className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  Format: Phone Number, Name, Email
                </div>
                <div className="flex items-center justify-center w-full">
                  <Textarea
                    placeholder="Phone Number, Name, Email..."
                    value={formInput}
                    onChange={(e) => setFormInput(e.target.value)}
                    className="w-full h-64"
                  />
                </div>
              </Tabs.Item>
            </Tabs>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button color="primary" onClick={handleOnboard}>
            Onboard
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default ManualOnboardVIPModal;
