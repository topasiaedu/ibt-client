/* eslint-disable jsx-a11y/anchor-is-valid */
import {
  Button,
  Label,
  Modal,
  TextInput,
  Select,
  FileInput,
  Textarea
} from "flowbite-react";
import type { FC } from "react";
import React, { useState } from "react";
import {
  HiPlus,
} from "react-icons/hi";
import { useTemplates } from "../../../hooks/whatsapp/useTemplate";
import { useWhatsappBusinessAccounts } from "../../../hooks/whatsapp/useWhatsappBusinessAccounts";
import { WhatsAppBusinessAccount } from "../../../types/whatsappBusinessAccountsTypes";
import { Template, TemplateFormData, ComponentFormData, DatabaseButtonFormData } from "../../../types/templateTypes";

// What we're trying to create:
// {
//   "name": "ws_feb28_lastpush",
//   "components": [
//     {
//       "type": "HEADER",
//       "format": "IMAGE",
//       "example": {
//         "header_handle": [
//           "https:\/\/scontent.whatsapp.net\/v\/t61.29466-34\/221367052_772825333968146_6919410577702217059_n.jpg?ccb=1-7&_nc_sid=8b1bef&_nc_ohc=C3YMkn7oaVQAX8p66uH&_nc_ht=scontent.whatsapp.net&edm=AH51TzQEAAAA&oh=01_ASAnabWlFjeDSbvAHSp66qlIm0RY72bkbv-S6npiKrXJzA&oe=66311C96"
//         ]
//       }
//     },
//     {
//       "type": "BODY",
//       "text": "*最后一天！你离财务自由只有一步之遥* ！💸\n\n今天就是你实现财务自由的最后一天！别再犹豫了，赶紧加入我们的投资课程吧！💰\n\n▫️▫️▫️▫️▫️▫️▫️\n赶紧点击进入直播间👉 https:\/\/bit.ly\/wsfebclass\n🟩  Zoom Meeting ID: 8229 179 4111 (888888)\n\n▫️▫️▫️▫️▫️▫️▫️"
//     },
//     {
//       "type": "FOOTER",
//       "text": "赶紧点击进入直播间 \/ 用Meeting ID 进也可以"
//     },
//     {
//       "type": "BUTTONS",
//       "buttons": [
//         {
//           "type": "URL",
//           "text": "点击进入课堂",
//           "url": "https:\/\/bit.ly\/wsfebclass"
//         }
//       ]
//     }
//   ],
//   "language": "zh_CN",
//   "status": "APPROVED",
//   "category": "MARKETING",        
//   "id": "772825330634813"
// },

const AddTemplateModal: FC = function () {
  const [isOpen, setOpen] = useState(false);
  const { addTemplate } = useTemplates();
  const { whatsappBusinessAccounts } = useWhatsappBusinessAccounts();
  const [selectedWhatsappBusinessAccount, setSelectedWhatsappBusinessAccount] = useState<WhatsAppBusinessAccount | null>(null);
  const [templateName, setTemplateName] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [buttons, setButtons] = useState<DatabaseButtonFormData[]>([]);
  const [headerType, setHeaderType] = useState<string>("");
  const [components, setComponents] = useState<ComponentFormData[]>([]);
  const [selectedLanguage, setSelectedLanguage] = useState<string>("");

  return (
    <>
      <Button color="primary" onClick={() => setOpen(true)}>
        <div className="flex items-center gap-x-3">
          <HiPlus className="text-xl" />
          Add Template
        </div>
      </Button>
      <Modal onClose={() => setOpen(false)} show={isOpen} >
        <Modal.Header className="border-b border-gray-200 !p-6 dark:border-gray-700">
          <strong>Add new Template</strong>
        </Modal.Header>
        <Modal.Body className="max-h-[calc(100vh-15rem)]">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-1">
            <div>
              <Label htmlFor="name">Name</Label>
              <div className="mt-1">
                <TextInput
                  id="name"
                  name="name"
                  placeholder="Campaign name"
                  onChange={(e) => setTemplateName(e.target.value)}
                  value={templateName}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="whatsappBusinessAccount">WhatsApp Business Account</Label>
              <div className="mt-1">
                <Select
                  id="whatsappBusinessAccount"
                  name="whatsappBusinessAccount"
                  onChange={(e) => setSelectedWhatsappBusinessAccount(whatsappBusinessAccounts.find((whatsappBusinessAccount) => whatsappBusinessAccount.account_id === parseInt(e.target.value)) || null)}
                >
                  <option value="">Select WhatsApp Business Account</option>
                  {whatsappBusinessAccounts.map((whatsappBusinessAccount) => (
                    <option key={whatsappBusinessAccount.account_id} value={whatsappBusinessAccount.account_id}>
                      {whatsappBusinessAccount.name}
                    </option>
                  ))}
                </Select>
              </div>
            </div>

            {/* Category Select: MARKETING, UTILITY,  */}
            <div>
              <Label htmlFor="category">Category</Label>
              <div className="mt-1">
                <Select
                  id="category"
                  name="category"
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  <option value="">Select Category</option>
                  <option value="MARKETING">Marketing</option>
                  <option value="UTILITY">Utility</option>
                </Select>
              </div>
            </div>

            {/* Language Select: zh_CN, us_EN */}
            <div>
              <Label htmlFor="language">Language</Label>
              <div className="mt-1">
                <Select
                  id="language"
                  name="language"
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  <option value="">Select Language</option>
                  <option value="zh_CN">Chinese</option>
                  <option value="us_EN">English</option>
                </Select>
              </div>
            </div>

            {/* Header Type */}
            <div>
              <Label htmlFor="headerType">Header Type</Label>
              <div className="mt-1">
                <Select
                  id="headerType"
                  name="headerType"
                  onChange={(e) => setHeaderType(e.target.value)}
                >
                  <option value="">Select Header Type</option>
                  <option value="IMAGE">Image</option>
                  <option value="TEXT">Text</option>
                </Select>
              </div>
            </div>

            {/* Render Different Fields based on Header Type */}
            {headerType === "IMAGE" && (
              <div>
                <Label htmlFor="headerImage">Header Image</Label>
                <div className="mt-1">
                  <FileInput
                    id="headerImage"
                    name="headerImage"
                    onChange={(e) => console.log(e.target.value)}
                  />
                </div>
              </div>
            )}

            {headerType === "TEXT" && (
              <div>
                <Label htmlFor="headerText">Header Text</Label>
                <div className="mt-1">
                  <TextInput
                    id="headerText"
                    name="headerText"
                    placeholder="Header Text"
                    onChange={(e) => console.log(e.target.value)}
                  />
                </div>
              </div>
            )}

            {/* Body */}
            <div>
              <Label htmlFor="body">Body</Label>
              <div className="mt-1">
                <Textarea
                  id="body"
                  name="body"
                  placeholder="Body"
                  onChange={(e) => console.log(e.target.value)}
                />
              </div>
            </div>

            {/* Footer */}
            <div>
              <Label htmlFor="footer">Footer</Label>
              <div className="mt-1">
                <TextInput
                  id="footer"
                  name="footer"
                  placeholder="Footer"
                  onChange={(e) => console.log(e.target.value)}
                />
              </div>
            </div>

            {/* User can add up to two buttons (Render number of fields based on input)  */}
            {/* User can choose type for each button (Button Type: QUICK_REPLY, URL)*/}

            {/* Choose Button Type */}
            <div>
              <Label htmlFor="buttonType">Button Type</Label>
              <div className="mt-1">
                <Select
                  id="buttonType"
                  name="buttonType"
                  onChange={(e) => console.log(e.target.value)}
                >
                  <option value="">Select Button Type</option>
                  <option value="QUICK_REPLY">Quick Reply</option>
                  <option value="URL">URL</option>
                </Select>
              </div>
            </div>

            {/* Add Button */}
            <div>
              <Button color="primary" onClick={() => setButtons([...buttons, { text: "", type: "", url: "" }])}>
                Add Button
              </Button>
            </div>

            {/* Render Button Fields */}
            {buttons.map((button, index) => (
              <div key={index}>
                <Label htmlFor="buttonText">Button Text</Label>
                <div className="mt-1">
                  <TextInput
                    id="buttonText"
                    name="buttonText"
                    placeholder="Button Text"
                    onChange={(e) => console.log(e.target.value)}
                  />
                </div>
                <Label htmlFor="buttonUrl">Button URL</Label>
                <div className="mt-1">
                  <TextInput
                    id="buttonUrl"
                    name="buttonUrl"
                    placeholder="Button URL"
                    onChange={(e) => console.log(e.target.value)}
                  />
                </div>
              </div>
            ))}
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button color="primary" onClick={() => setOpen(false)}>
            Add user
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default AddTemplateModal;