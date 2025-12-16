import { AppLayout } from "@/components/app/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Target,
  Send,
  Calendar,
  Clock,
  Percent,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const kpis = [
  {
    title: "Postulaciones",
    value: "12",
    change: "+4 esta semana",
    trend: "up",
    icon: Send,
  },
  {
    title: "Entrevistas",
    value: "3",
    change: "+1 esta semana",
    trend: "up",
    icon: Calendar,
  },
  {
    title: "Tasa de Entrevistas",
    value: "25%",
    change: "+5% vs mes anterior",
    trend: "up",
    icon: Percent,
  },
  {
    title: "Tiempo a Entrevista",
    value: "8 días",
    change: "-2 días vs promedio",
    trend: "up",
    icon: Clock,
  },
];

const weeklyData = [
  { week: "Sem 1", postulaciones: 2, entrevistas: 0 },
  { week: "Sem 2", postulaciones: 3, entrevistas: 1 },
  { week: "Sem 3", postulaciones: 4, entrevistas: 1 },
  { week: "Sem 4", postulaciones: 3, entrevistas: 1 },
];

const channelData = [
  { name: "LinkedIn", value: 5, fill: "hsl(var(--chart-1))" },
  { name: "Referidos", value: 3, fill: "hsl(var(--chart-2))" },
  { name: "Bumeran", value: 2, fill: "hsl(var(--chart-3))" },
  { name: "Manual", value: 2, fill: "hsl(var(--chart-4))" },
];

const scoreEvolution = [
  { month: "Sep", score: 65 },
  { month: "Oct", score: 68 },
  { month: "Nov", score: 72 },
  { month: "Dic", score: 78 },
];

export default function Analitica() {
  return (
    <AppLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-2">
            Analítica de Campaña
          </h1>
          <p className="text-muted-foreground">
            Métricas y KPIs de tu búsqueda de empleo. Datos = mejores decisiones.
          </p>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {kpis.map((kpi) => (
            <Card key={kpi.title} className="border-border">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      {kpi.title}
                    </p>
                    <p className="text-3xl font-bold text-foreground">
                      {kpi.value}
                    </p>
                    <p
                      className={`text-xs mt-1 flex items-center gap-1 ${
                        kpi.trend === "up" ? "text-success" : "text-destructive"
                      }`}
                    >
                      {kpi.trend === "up" ? (
                        <TrendingUp className="w-3 h-3" />
                      ) : (
                        <TrendingDown className="w-3 h-3" />
                      )}
                      {kpi.change}
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <kpi.icon className="w-6 h-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Activity Chart */}
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <BarChart3 className="w-5 h-5 text-primary" />
                Actividad semanal
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="week" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar dataKey="postulaciones" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="entrevistas" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
              <div className="flex items-center justify-center gap-6 mt-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-primary" />
                  <span className="text-sm text-muted-foreground">Postulaciones</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-accent" />
                  <span className="text-sm text-muted-foreground">Entrevistas</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Channel Distribution */}
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Target className="w-5 h-5 text-primary" />
                Eficacia por canal
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center">
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={channelData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {channelData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-4 mt-4">
                {channelData.map((channel) => (
                  <div key={channel.name} className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded"
                      style={{ backgroundColor: channel.fill }}
                    />
                    <span className="text-sm text-muted-foreground">
                      {channel.name} ({channel.value})
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Score Evolution */}
          <Card className="border-border lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <TrendingUp className="w-5 h-5 text-primary" />
                Evolución de tu Score ATS
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={scoreEvolution}>
                  <defs>
                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} domain={[50, 100]} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="score"
                    stroke="hsl(var(--primary))"
                    fillOpacity={1}
                    fill="url(#colorScore)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
