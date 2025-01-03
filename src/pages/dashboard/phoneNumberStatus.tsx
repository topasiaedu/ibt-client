import React from "react";
import { useWhatsAppBusinessAccountContext } from "../../context/WhatsAppBusinessAccountContext";
import { usePhoneNumberContext } from "../../context/PhoneNumberContext";
import { Badge, Card } from "flowbite-react";
import { useProjectContext } from "../../context/ProjectContext";

const PhoneNumberStatus = function () {
  const { phoneNumbers } = usePhoneNumberContext();
  const { currentProject } = useProjectContext();
  const { whatsAppBusinessAccounts } = useWhatsAppBusinessAccountContext();
  const finalPhoneNumbers = phoneNumbers.filter((phoneNumber) => {
    return phoneNumber.project_id === currentProject?.project_id
  });

  return (
    <Card className="p-4">
      <h2 className="text-lg font-semibold">Phone Number Status</h2>

      {finalPhoneNumbers
      .filter((phoneNumber) => phoneNumber.quality_rating !== "UNKNOWN")
      .map((phoneNumber) => (
        <div
          key={phoneNumber.phone_number_id}
          className="flex items-center justify-between mt-4">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {phoneNumber.number}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <Badge color={generateBadgeColor(phoneNumber.quality_rating)}>
                {phoneNumber.quality_rating}
              </Badge>
            </p>
          </div>
        </div>
      ))}
    </Card>
  );
};

const generateBadgeColor = function (qualityRating:string | null) {
  if (!qualityRating) {
    return "info";
  }
  // LOW | MEDIUM | HEALTHY
  switch (qualityRating) {
    case "LOW":
      return "red";
    case "MEDIUM":
      return "yellow";
    case "HEALTHY":
      return "green";
    default:
      return qualityRating.toLowerCase();
  }
}
export default PhoneNumberStatus;
