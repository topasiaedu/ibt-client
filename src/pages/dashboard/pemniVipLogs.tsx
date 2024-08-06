import React, { useEffect } from "react";
import {
  PemniVipLog,
  usePemniVipLogsContext,
} from "../../context/PemniVipLogsContext";
import { Badge, Button, Card, Label, Table, TextInput } from "flowbite-react";
import EditContactModal from "../contacts/edit-contact-modal";
import ManualOnboardVIPModal from "./manual-onboard-modal";

const PemniVipLogs = function () {
  const { pemniVipLogs, retry } = usePemniVipLogsContext();
  const [searchValue, setSearchValue] = React.useState("");

  useEffect(() => {
  }, [pemniVipLogs]);

  return (
    <Card className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Pemni VIP Logs</h2>
        <ManualOnboardVIPModal />
      </div>
      <form className="lg:pr-3">
        <Label htmlFor="users-search" className="sr-only">
          Search
        </Label>
        <div className="relative mt-1 lg:w-64 xl:w-96">
          <TextInput
            id="users-search"
            name="users-search"
            placeholder="Search for users"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
          />
        </div>
      </form>
      <div className="max-h-96 overflow-y-auto hide-scrollbar">
        <Table className="min-w-full divide-y divide-gray-200 dark:divide-gray-600">
          <Table.Head className="bg-gray-100 dark:bg-gray-700">
            <Table.HeadCell>Date</Table.HeadCell>
            <Table.HeadCell>Name</Table.HeadCell>
            <Table.HeadCell>Email</Table.HeadCell>
            <Table.HeadCell>Phone</Table.HeadCell>
            <Table.HeadCell>Password</Table.HeadCell>
            <Table.HeadCell>Status</Table.HeadCell>
            <Table.HeadCell>Actions</Table.HeadCell>
          </Table.Head>
          <Table.Body className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
            {pemniVipLogs
              .filter((log) => {
                const nameMatch = log.contact?.name
                  ? log.contact?.name
                      .toLowerCase()
                      .includes(searchValue.toLowerCase())
                  : false;
                const emailMatch = log.contact?.email
                  ? log.contact?.email
                      .toLowerCase()
                      .includes(searchValue.toLowerCase())
                  : false;
                const phoneMatch = log.contact?.phone
                  ? log.contact?.phone
                      .toLowerCase()
                      .includes(searchValue.toLowerCase())
                  : false;

                return nameMatch || emailMatch || phoneMatch;
              })
              .map((log) => (
                <Table.Row key={log.id}>
                  <Table.Cell>
                    {new Date(log.created_at).toLocaleString()}
                  </Table.Cell>
                  <Table.Cell>{log.contact?.name}</Table.Cell>
                  <Table.Cell>{log.contact?.email || ""}</Table.Cell>
                  <Table.Cell>{log.contact?.wa_id}</Table.Cell>
                  <Table.Cell>{log.password}</Table.Cell>
                  <Table.Cell>{generateBadge(log)}</Table.Cell>
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

const STATUS_COLORS: { [key: string]: string } = {
  WEBHOOK_RECEIVED: "success",
  BUBBLE_UPDATED: "info",
  MESSAGE_SENT: "info",
  MESSAGE_FAILED: "danger",
  WEBHOOK_ERROR: "danger",
  SUCCESS: "success",
  FAILED: "danger",
  accepted: "success",
  failed: "danger",
  delivered: "info",
  read: "warning",
};

const STATUS_LABELS: { [key: string]: string } = {
  WEBHOOK_RECEIVED: "Webhook Received",
  BUBBLE_UPDATED: "Bubble Updated",
  MESSAGE_SENT: "Message Sent",
  MESSAGE_FAILED: "Message Failed",
  WEBHOOK_ERROR: "Webhook Error",
  SUCCESS: "Success",
  FAILED: "Failed",
  accepted: "Accepted",
  failed: "Failed",
  delivered: "Delivered",
  read: "Read",
};

const generateBadge = (log: PemniVipLog) => {
  if (log.message) {
    const { status, error } = log.message;
    if (status === "failed") {
      return (
        <div>
          <Badge className="w-fit" color="red">
            {(error as any)?.error_data?.details}
          </Badge>
          <span className="text-xs font-normal text-red-500"></span>
        </div>
      );
    }

    if (!status) {
      return null;
    }
    const color = STATUS_COLORS[status] || "default";
    const label = STATUS_LABELS[status] || status;
    return (
      <Badge className="w-fit" color={color}>
        {label}
      </Badge>
    );
  } else {
    const status = log.status;
    const color = STATUS_COLORS[status] || "default";
    const label = STATUS_LABELS[status] || status;
    return (
      <Badge className="w-fit" color={color}>
        {label}
      </Badge>
    );
  }
};

export default PemniVipLogs;
