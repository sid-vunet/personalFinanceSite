import React, { lazy, Suspense } from "react";

// Lazy load echarts to avoid SSR issues
const ReactEChartsCore = lazy(() => import("echarts-for-react/lib/core"));

interface TrendData {
  date: string;
  amount: number;
}

interface SpendingTrendChartProps {
  data: TrendData[];
  title?: string;
  height?: string;
  showBudgetLine?: boolean;
  budgetAmount?: number;
}

export function SpendingTrendChart({
  data,
  title = "Spending Trend",
  height = "300px",
  showBudgetLine = false,
  budgetAmount = 0,
}: SpendingTrendChartProps) {
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
        charts.LineChart,
        renderers.CanvasRenderer,
      ]);
      setEchartsModule(core);
    });
  }, []);

  const dates = data.map((item) => item.date);
  const amounts = data.map((item) => item.amount);

  const series: any[] = [
    {
      name: "Spending",
      type: "line",
      smooth: true,
      data: amounts,
      areaStyle: {
        opacity: 0.3,
      },
      lineStyle: {
        width: 3,
      },
      itemStyle: {
        color: "#2563eb",
      },
    },
  ];

  if (showBudgetLine && budgetAmount > 0) {
    series.push({
      name: "Budget",
      type: "line",
      data: new Array(dates.length).fill(budgetAmount),
      lineStyle: {
        type: "dashed",
        width: 2,
        color: "#ef4444",
      },
      itemStyle: {
        color: "#ef4444",
      },
      symbol: "none",
    });
  }

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
      data: showBudgetLine ? ["Spending", "Budget"] : ["Spending"],
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
      boundaryGap: false,
      data: dates,
      axisLabel: {
        rotate: 45,
      },
    },
    yAxis: {
      type: "value",
      axisLabel: {
        formatter: (value: number) => `₹${(value / 1000).toFixed(0)}k`,
      },
    },
    series,
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
