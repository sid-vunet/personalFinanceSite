import React, { lazy, Suspense } from "react";

// Lazy load echarts to avoid SSR issues
const ReactEChartsCore = lazy(() => import("echarts-for-react/lib/core"));

interface BudgetData {
  category: string;
  budget: number;
  spent: number;
}

interface BudgetComparisonChartProps {
  data: BudgetData[];
  title?: string;
  height?: string;
}

export function BudgetComparisonChart({
  data,
  title = "Budget vs Actual",
  height = "300px",
}: BudgetComparisonChartProps) {
  const [echartsModule, setEchartsModule] = React.useState<typeof import("echarts/core") | null>(null);
  const [isClient, setIsClient] = React.useState(false);

  React.useEffect(() => {
    setIsClient(true);
    // Dynamically import echarts modules
    Promise.all([
      import("echarts/core"),
      import("echarts/charts"),
      import("echarts/components"),
      import("echarts/renderers"),
    ]).then(([core, charts, components, renderers]) => {
      core.use([
        components.TitleComponent,
        components.TooltipComponent,
        components.GridComponent,
        components.LegendComponent,
        charts.BarChart,
        renderers.CanvasRenderer,
      ]);
      setEchartsModule(core);
    });
  }, []);

  const categories = data.map((item) => item.category);
  const budgetAmounts = data.map((item) => item.budget);
  const spentAmounts = data.map((item) => item.spent);

  const option = {
    title: {
      text: title,
      left: "center",
      textStyle: {
        fontSize: 16,
        fontWeight: 600,
        color: "#0f172a",
      },
    },
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "shadow",
      },
      formatter: (params: unknown[]) => {
        const p = params as { seriesName: string; value: number; axisValue: string }[];
        let result = `${p[0].axisValue}<br/>`;
        p.forEach((item) => {
          result += `${item.seriesName}: ₹${item.value.toLocaleString("en-IN")}<br/>`;
        });
        return result;
      },
    },
    legend: {
      bottom: 0,
      data: ["Budget", "Spent"],
    },
    grid: {
      left: "3%",
      right: "4%",
      bottom: "15%",
      top: "15%",
      containLabel: true,
    },
    xAxis: {
      type: "category",
      data: categories,
      axisLabel: {
        rotate: 45,
        interval: 0,
      },
    },
    yAxis: {
      type: "value",
      axisLabel: {
        formatter: (value: number) => `₹${(value / 1000).toFixed(0)}k`,
      },
    },
    series: [
      {
        name: "Budget",
        type: "bar",
        data: budgetAmounts,
        itemStyle: {
          color: "#94a3b8",
          borderRadius: [4, 4, 0, 0],
        },
      },
      {
        name: "Spent",
        type: "bar",
        data: spentAmounts.map((spent, index) => ({
          value: spent,
          itemStyle: {
            color: spent > budgetAmounts[index] ? "#ef4444" : "#10b981",
            borderRadius: [4, 4, 0, 0],
          },
        })),
      },
    ],
  };

  if (!isClient || !echartsModule) {
    return (
      <div style={{ height }} className="flex items-center justify-center bg-muted/20 rounded-lg">
        <span className="text-muted-foreground">Loading chart...</span>
      </div>
    );
  }

  return (
    <Suspense fallback={<div style={{ height }} className="flex items-center justify-center"><span>Loading...</span></div>}>
      <ReactEChartsCore
        echarts={echartsModule}
        option={option}
        style={{ height }}
        notMerge={true}
        lazyUpdate={true}
      />
    </Suspense>
  );
}
