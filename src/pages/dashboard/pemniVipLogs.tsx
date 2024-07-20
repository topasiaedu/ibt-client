import React from "react";
import { usePemniVipLogsContext } from "../../context/PemniVipLogsContext";
import { Badge, Button, Card, Table } from "flowbite-react";
import EditContactModal from "../contacts/edit-contact-modal";

const PemniVipLogs = function () {
  const { pemniVipLogs, retry } = usePemniVipLogsContext();

  return (
    <Card className="p-4">
      <h2 className="text-lg font-semibold">Pemni VIP Logs</h2>
      <div className="max-h-96 overflow-y-auto hide-scrollbar">
        <Table className="min-w-full divide-y divide-gray-200 dark:divide-gray-600">
          <Table.Head className="bg-gray-100 dark:bg-gray-700">
            <Table.HeadCell>Date</Table.HeadCell>
            <Table.HeadCell>Name</Table.HeadCell>
            <Table.HeadCell>Email</Table.HeadCell>
            <Table.HeadCell>Password</Table.HeadCell>
            <Table.HeadCell>Status</Table.HeadCell>
            <Table.HeadCell>Actions</Table.HeadCell>
          </Table.Head>
          <Table.Body className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
            {pemniVipLogs.map((log) => (
              <Table.Row key={log.id}>
                <Table.Cell>
                  {new Date(log.created_at).toLocaleString()}
                </Table.Cell>
                <Table.Cell>{log.contact?.name}</Table.Cell>
                <Table.Cell>{log.contact?.email || ""}</Table.Cell>
                <Table.Cell>{log.password}</Table.Cell>
                <Table.Cell>
                  {log.status === "SUCCESS" ? (
                    <Badge className="w-fit">Success</Badge>
                  ) : (
                    <Badge className="w-fit" color="danger">
                      Failed
                    </Badge>
                  )}
                </Table.Cell>
                <Table.Cell>
                  <div className="space-x-2 flex">
                    <Button
                      size="sm"
                      color="primary"
                      onClick={() =>
                        retry(log.contact, log.password || undefined)
                      }>
                      Retry
                    </Button>
                    {/* Edit Contact */}
                    <EditContactModal contact={log.contact} />
                  </div>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      </div>
    </Card>
  );
};

export default PemniVipLogs;