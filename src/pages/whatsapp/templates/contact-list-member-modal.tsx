/* eslint-disable jsx-a11y/anchor-is-valid */
import { Button, Modal, Table } from "flowbite-react";
import React, { useState } from "react";
import { CiViewTable } from "react-icons/ci";
import { Template } from "../../../context/TemplateContext";
import { useWhatsAppBusinessAccountContext } from "../../../context/WhatsAppBusinessAccountContext";

interface ContactListMemberModalProps {
  templates: Template[];
}

const TemplateApprovalModal: React.FC<ContactListMemberModalProps> = function ({
  templates,
}) {
  const [isOpen, setOpen] = useState(false);
  const { whatsAppBusinessAccounts } = useWhatsAppBusinessAccountContext();

  return (
    <>
      <Button color="primary" onClick={() => setOpen(true)}>
        <div className="flex items-center gap-x-3">
          <CiViewTable className="text-xs" />
          View All
        </div>
      </Button>
      <Modal onClose={() => setOpen(false)} show={isOpen} size="7xl">
        <Modal.Header className="border-b border-gray-200 !p-6 dark:border-gray-700">
          <strong>Contact List Members</strong>
        </Modal.Header>
        <Modal.Body>
          <div className="flex flex-col p-4 max-h-96">
            <div className="overflow-x-auto">
              <div className="inline-block min-w-full align-middle">
                <div className="overflow-hidden shadow">
                  <Table className="min-w-full divide-y divide-gray-200 dark:divide-gray-600">
                    <Table.Head className="bg-gray-100 dark:bg-gray-700">
                      <Table.HeadCell>Whatsapp Business Account</Table.HeadCell>
                      <Table.HeadCell>Status</Table.HeadCell>
                    </Table.Head>
                    <Table.Body className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
                      {templates.map((template) => (
                        <Table.Row key={template.template_id}>
                          <Table.Cell>
                            {
                              whatsAppBusinessAccounts.find(
                                (waba) =>
                                  waba.account_id === template.account_id
                              )?.name
                            }
                          </Table.Cell>
                          <Table.Cell>
                            <div className="flex items-center">
                              {getStatusIndicator(template.status)}{" "}
                              {template.status}
                            </div>
                          </Table.Cell>
                        </Table.Row>
                      ))}
                    </Table.Body>
                  </Table>
                </div>
              </div>
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
};

const getStatusIndicator = (status: string) => {
  // Pending, Approved, Draft, Rejected
  switch (status) {
    case "PENDING":
      return <div className="mr-2 h-2.5 w-2.5 rounded-full bg-yellow-400" />;
    case "APPROVED":
      return <div className="mr-2 h-2.5 w-2.5 rounded-full bg-green-400" />;
    case "DRAFT":
      return <div className="mr-2 h-2.5 w-2.5 rounded-full bg-blue-400" />;
    case "REJECTED":
      return <div className="mr-2 h-2.5 w-2.5 rounded-full bg-red-400" />;
    default:
      return <div className="mr-2 h-2.5 w-2.5 rounded-full bg-gray-400" />;
  }
};

export default TemplateApprovalModal;
