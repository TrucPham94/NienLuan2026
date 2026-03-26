import { useState, useEffect } from "react";
import api from "../api/axios";
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Chip,
} from "@mui/material";
import PeopleIcon from "@mui/icons-material/People";
import ApartmentIcon from "@mui/icons-material/Apartment";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import WarningIcon from "@mui/icons-material/Warning";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

const StatCard = ({ title, value, icon, color }) => (
  <Card sx={{ height: "100%" }}>
    <CardContent>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Box>
          <Typography variant="body2" color="text.secondary">
            {title}
          </Typography>
          <Typography variant="h3" fontWeight="bold" sx={{ mt: 1 }}>
            {value}
          </Typography>
        </Box>
        <Box
          sx={{
            bgcolor: `${color}20`,
            borderRadius: 2,
            p: 1.5,
            display: "flex",
            alignItems: "center",
          }}
        >
          {icon}
        </Box>
      </Box>
    </CardContent>
  </Card>
);

const COLORS = [
  "#1976d2",
  "#2e7d32",
  "#ed6c02",
  "#9c27b0",
  "#d32f2f",
  "#0288d1",
];

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/reports/dashboard/")
      .then((res) => setData(res.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <CircularProgress />;

  const pieData = [
    { name: "Chính thức", value: data.employee_type_stats.official },
    { name: "Thử việc", value: data.employee_type_stats.probation },
  ];

  return (
    <Box>
      <Typography variant="h5" fontWeight="bold" mb={3}>
        Dashboard
      </Typography>

      {/* Stat cards */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Tổng nhân viên"
            value={data.total_employees}
            color="#1976d2"
            icon={<PeopleIcon sx={{ color: "#1976d2", fontSize: 32 }} />}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Phòng ban"
            value={data.total_departments}
            color="#2e7d32"
            icon={<ApartmentIcon sx={{ color: "#2e7d32", fontSize: 32 }} />}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Vào làm tháng này"
            value={data.new_this_month}
            color="#ed6c02"
            icon={<PersonAddIcon sx={{ color: "#ed6c02", fontSize: 32 }} />}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Hợp đồng sắp hết hạn"
            value={data.expiring_contracts}
            color="#d32f2f"
            icon={<WarningIcon sx={{ color: "#d32f2f", fontSize: 32 }} />}
          />
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={3}>
        {/* Bar chart - nhân viên theo phòng ban */}
        <Grid item xs={12} md={7}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" mb={2}>
                Nhân viên theo phòng ban
              </Typography>
              {data.dept_stats.length === 0 ? (
                <Typography color="text.secondary">Chưa có dữ liệu</Typography>
              ) : (
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart
                    data={data.dept_stats}
                    margin={{ top: 5, right: 20, left: 0, bottom: 60 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="name"
                      angle={-30}
                      textAnchor="end"
                      interval={0}
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="count" name="Nhân viên" radius={[4, 4, 0, 0]}>
                      {data.dept_stats.map((_, index) => (
                        <Cell
                          key={index}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Pie chart - loại nhân sự */}
        <Grid item xs={12} md={5}>
          <Card sx={{ height: "100%" }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" mb={2}>
                Tỉ lệ loại nhân sự
              </Typography>
              {data.total_employees === 0 ? (
                <Typography color="text.secondary">Chưa có dữ liệu</Typography>
              ) : (
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      outerRadius={90}
                      dataKey="value"
                      label={({ name, percent }) =>
                        `${name}: ${(percent * 100).toFixed(0)}%`
                      }
                    >
                      {pieData.map((_, index) => (
                        <Cell key={index} fill={COLORS[index]} />
                      ))}
                    </Pie>
                    <Legend />
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
