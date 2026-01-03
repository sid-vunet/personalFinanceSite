import React, { useEffect, useRef } from "react";
import * as echarts from "echarts";

interface CategoryData {
  category: string;
  value: number;
  color?: string;
}

interface CategoryPieChartForBudgetProps {
  data: CategoryData[];
  title?: string;
  height?: string;
}

export function CategoryPieChartForBudget({
  data,
  title = "Spending by Category",
  height = "400px",
}: CategoryPieChartForBudgetProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);

  useEffect(() => {
    if (!chartRef.current) return;

    // Initialize chart
    if (!chartInstance.current) {
      chartInstance.current = echarts.init(chartRef.current);
    }

    const pieData = data.map((item) => ({
      name: item.category,
      value: item.value,
      itemStyle: item.color ? { color: item.color } : undefined,
    }));

    const option: echarts.EChartsOption = {
      title: {
        text: title,
        left: "center",
      },
      tooltip: {
        trigger: "item",
        formatter: (params: any) => {
          return `
            <div>
              <div style="font-weight: bold; margin-bottom: 5px;">${params.name}</div>
              <div>Amount: ₹${params.value.toLocaleString("en-IN")}</div>
              <div>Percentage: ${params.percent}%</div>
            </div>
          `;
        },
      },
      legend: {
        orient: "vertical",
        left: "left",
        top: "middle",
      },
      series: [
        {
          name: "Category",
          type: "pie",
          radius: ["40%", "70%"],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 10,
            borderColor: "#fff",
            borderWidth: 2,
          },
          label: {
            show: true,
            formatter: "{b}: ₹{c}",
          },
          emphasis: {
            label: {
              show: true,
              fontSize: 16,
              fontWeight: "bold",
            },
          },
          labelLine: {
            show: true,
          },
          data: pieData,
        },
      ],
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
