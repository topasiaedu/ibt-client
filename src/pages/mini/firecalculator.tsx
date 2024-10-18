import React, { useEffect, useState } from "react";
import { Table, Card } from "flowbite-react"; // Import Flowbite's Table and Card for styling

type YearlyData = {
  age: number;
  capital: number;
  monthlyInvestment: number;
  dividend: number;
  appreciation: number;
  yearlyPourIn: number;
  yearlySpend: number;
};

const FIRECalculatorTable = ({ fireResults }: { fireResults: YearlyData[] }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-800">
      <div className="w-full max-w-4xl text-center py-10 dark:text-white">
        <h1 className="text-4xl font-extrabold text-gray-800 mb-6 dark:text-white">
          Your FIRE Report
        </h1>
        <p className="text-lg text-gray-500 dark:text-gray-400">
          A detailed report of your financial journey towards retirement
        </p>
      </div>

      {fireResults.length > 0 && (
        <div className="w-full max-w-4xl">
          <Card>
            <div className="overflow-auto max-h-96 hide-scrollbar"> {/* Limit height to enable scrolling */}
              <Table hoverable={true}>
                <Table.Head className="sticky top-0 bg-white dark:bg-gray-800 z-10"> {/* Sticky Header */}
                  <Table.HeadCell>Age</Table.HeadCell>
                  <Table.HeadCell>Capital ($)</Table.HeadCell>
                  <Table.HeadCell>Monthly Investment ($)</Table.HeadCell>
                  <Table.HeadCell>Dividend ($)</Table.HeadCell>
                  <Table.HeadCell>Appreciation ($)</Table.HeadCell>
                  <Table.HeadCell>Yearly Pour-in ($)</Table.HeadCell>
                  <Table.HeadCell>Yearly Spend ($)</Table.HeadCell>
                </Table.Head>
                <Table.Body>
                  {fireResults.map((row) => (
                    <Table.Row key={row.age}>
                      <Table.Cell>{row.age}</Table.Cell>
                      <Table.Cell>${row.capital.toLocaleString()}</Table.Cell>
                      <Table.Cell>
                        ${row.monthlyInvestment.toLocaleString()}
                      </Table.Cell>
                      <Table.Cell>${row.dividend.toLocaleString()}</Table.Cell>
                      <Table.Cell>
                        ${row.appreciation.toLocaleString()}
                      </Table.Cell>
                      <Table.Cell>
                        ${row.yearlyPourIn.toLocaleString()}
                      </Table.Cell>
                      <Table.Cell>${row.yearlySpend.toLocaleString()}</Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default FIRECalculatorTable;
