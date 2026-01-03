import React, { useEffect, useRef } from "react";
import * as echarts from "echarts";

interface DailySpendingData {
  date: string;
  categories: { [category: string]: number };
}

interface DailySpendingByCategoryProps {
  data: DailySpendingData[];
  title?: string;
  height?: string;
}

export function DailySpendingByCategory({
  data,
  title = "Daily Spending by Category",
  height = "400px",
}: DailySpendingByCategoryProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);

  useEffect(() => {
    if (!chartRef.current) return;

    // Initialize chart
    if (!chartInstance.current) {
      chartInstance.current = echarts.init(chartRef.current);
    }

    // Extract all unique categories
    const categories = new Set<string>();
    data.forEach((day) => {
      Object.keys(day.categories).forEach((cat) => categories.add(cat));
    });

    const categoryArray = Array.from(categories);
    const dates = data.map((d) => d.date);

    // Create series for each category
    const series = categoryArray.map((category) => ({
      name: category,
      type: "bar",
      stack: "total",
      data: data.map((day) => day.categories[category] || 0),
      emphasis: {
        focus: "series",
      },
    }));

    const option: echarts.EChartsOption = {
      title: {
        text: title,
        left: "center",
      },
      tooltip: {
        trigger: "axis",
        axisPointer: {
          type: "shadow",
        },
        formatter: (params: any) => {
          if (!Array.isArray(params)) return "";
          let total = 0;
          let result = `<div style="font-weight: bold; margin-bottom: 5px;">${params[0].axisValue}</div>`;
          params.forEach((param: any) => {
            if (param.value > 0) {
              total += param.value;
              result += `
                <div style="display: flex; align-items: center; margin: 3px 0;">
                  <span style="display: inline-block; width: 10px; height: 10px; background-color: ${param.color}; border-radius: 50%; margin-right: 5px;"></span>
                  <span style="flex: 1;">${param.seriesName}:</span>
                  <span style="font-weight: bold; margin-left: 10px;">₹${param.value.toLocaleString("en-IN")}</span>
                </div>
              `;
            }
          });
          result += `<div style="margin-top: 8px; padding-top: 5px; border-top: 1px solid #ccc; font-weight: bold;">Total: ₹${total.toLocaleString("en-IN")}</div>`;
          return result;
        },
      },
      legend: {
        data: categoryArray,
        bottom: 0,
      },
      grid: {
        left: "3%",
        right: "4%",
        bottom: "15%",
        containLabel: true,
      },
      xAxis: {
        type: "category",
        data: dates,
        axisLabel: {
          rotate: 45,
        },
      },
      yAxis: {
        type: "value",
        axisLabel: {
          formatter: (value: number) => `₹${value.toLocaleString("en-IN")}`,
        },
      },
      series: series,
    };

    chartInstance.current.setOption(option);

    // Handle resize
    const handleResize = () => {
      chartInstance.current?.resize();
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [data, title]);

  return <div ref={chartRef} style={{ width: "100%", height }} />;
}
