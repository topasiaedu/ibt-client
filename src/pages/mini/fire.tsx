import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Table, Card } from "flowbite-react";
import FIRECalculatorTable from "./firecalculator";

type YearlyData = {
  age: number;
  capital: number;
  monthlyInvestment: number;
  dividend: number;
  appreciation: number;
  yearlyPourIn: number;
  yearlySpend: number;
};

const FIRECalculator = () => {
  const {
    age,
    targetAge,
    monthlyIncome,
    monthlyExpenses,
    inflationRate,
    annualContribution,
    capital,
    dividendRate,
    appreciationRate,
  } = useParams();

  const [fireResults, setFireResults] = useState<YearlyData[]>([]);

  useEffect(() => {
    if (
      age &&
      targetAge &&
      monthlyIncome &&
      monthlyExpenses &&
      inflationRate &&
      annualContribution &&
      capital &&
      dividendRate &&
      appreciationRate
    ) {
      calculateFIRE();
    }
    }, [
    age,
    targetAge,
    monthlyIncome,
    monthlyExpenses,
    inflationRate,
    annualContribution,
    capital,
    dividendRate,
    appreciationRate,
  ]);

  if (
    !age ||
    !targetAge ||
    !monthlyIncome ||
    !monthlyExpenses ||
    !inflationRate ||
    !annualContribution ||
    !capital ||
    !dividendRate ||
    !appreciationRate
  ) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
        <div className="w-full max-w-4xl text-center py-10">
          <h1 className="text-4xl font-extrabold text-gray-800 mb-6">
            FIRE Calculator
          </h1>
          <p className="text-lg text-gray-500">
            Please provide the necessary parameters in the URL
          </p>
        </div>
      </div>
    );
  }

  const calculateFIRE = () => {
    const parsedAge = parseInt(age);
    const parsedTargetAge = parseInt(targetAge);
    const parsedMonthlyIncome = parseFloat(monthlyIncome);
    const parsedMonthlyExpenses = parseFloat(monthlyExpenses);
    const parsedInflationRate = parseFloat(inflationRate) / 100;
    const parsedAnnualContribution = parseFloat(annualContribution);
    const parsedCapital = parseFloat(capital);
    const parsedDividendRate = parseFloat(dividendRate) / 100;
    const parsedAppreciationRate = parseFloat(appreciationRate) / 100;

    let currentCapital = parsedCapital;
    let yearlyData: YearlyData[] = [];

    for (
      let currentAge = parsedAge;
      currentAge <= parsedTargetAge;
      currentAge++
    ) {
      const monthlyInvestment =
        parsedMonthlyExpenses *
        (1 + parsedAppreciationRate) ** (currentAge - parsedAge) *
        12;
      const dividend = currentCapital * parsedDividendRate;
      const appreciation = currentCapital * parsedAppreciationRate;
      const yearlyPourIn =
        currentCapital +
        monthlyInvestment +
        dividend +
        appreciation +
        parsedAnnualContribution;
      const yearlySpend =
        parsedMonthlyIncome *
        (1 + parsedInflationRate) ** (currentAge - parsedAge) *
        12;

      yearlyData.push({
        age: currentAge,
        capital: Math.round(currentCapital),
        monthlyInvestment: Math.round(monthlyInvestment),
        dividend: Math.round(dividend),
        appreciation: Math.round(appreciation),
        yearlyPourIn: Math.round(yearlyPourIn),
        yearlySpend: Math.round(yearlySpend),
      });

      currentCapital = yearlyPourIn; // Update capital for the next year
    }

    setFireResults(yearlyData);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-800">
      {fireResults.length > 0 && (
        <FIRECalculatorTable fireResults={fireResults} />
      )}
    </div>
  );
};

export default FIRECalculator;
