import React, { lazy, Suspense } from "react";

// Lazy load echarts to avoid SSR issues
const ReactEChartsCore = lazy(() => import("echarts-for-react/lib/core"));

interface CategoryData {
  name: string;
  value: number;
  color?: string;
}

interface CategoryPieChartProps {
  data: CategoryData[];
  title?: string;
  height?: string;
}

export function CategoryPieChart({
  data,
  title = "Expenses by Category",
  height = "300px",
}: CategoryPieChartProps) {
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
        components.LegendComponent,
        charts.PieChart,
        renderers.CanvasRenderer,
      ]);
      setEchartsModule(core);
    });
  }, []);

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
      trigger: "item",
      formatter: "{b}: ₹{c} ({d}%)",
    },
    legend: {
      orient: "horizontal",
      bottom: "0%",
      type: "scroll",
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
          show: false,
          position: "center",
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 18,
            fontWeight: "bold",
          },
        },
        labelLine: {
          show: false,
        },
        data: data.map((item) => ({
          name: item.name,
          value: item.value,
          itemStyle: item.color ? { color: item.color } : undefined,
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
