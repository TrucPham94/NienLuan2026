import { useState, useEffect } from "react";
import api from "../api/axios";
import {
  Box,
  Button,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  TextField,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  CircularProgress,
  Alert,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import BlockIcon from "@mui/icons-material/Block";
import SearchIcon from "@mui/icons-material/Search";
import FileDownloadIcon from "@mui/icons-material/FileDownload";

const EMPTY_FORM = {
  full_name: "",
  date_of_birth: "",
  gender: "M",
  id_card: "",
  address: "",
  phone: "",
  email: "",
  department: "",
  position: "",
  start_date: "",
  employee_type: "probation",
  status: "active",
};

export default function EmployeePage() {
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [positions, setPositions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchEmployees = async () => {
    try {
      const res = await api.get(`/employees/?search=${search}`);
      setEmployees(res.data.results || res.data);
    } catch {
      setError("Không thể tải danh sách nhân viên");
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartmentsAndPositions = async () => {
    const [deptRes, posRes] = await Promise.all([
      api.get("/departments/"),
      api.get("/departments/positions/"),
    ]);
    setDepartments(deptRes.data.results || deptRes.data);
    setPositions(posRes.data.results || posRes.data);
  };

  useEffect(() => {
    fetchDepartmentsAndPositions();
  }, []);
  useEffect(() => {
    fetchEmployees();
  }, [search]);

  const handleOpen = (emp = null) => {
    if (emp) {
      setEditingId(emp.id);
      setForm({
        full_name: emp.full_name,
        date_of_birth: emp.date_of_birth,
        gender: emp.gender,
        id_card: emp.id_card,
        address: emp.address || "",
        phone: emp.phone || "",
        email: emp.email,
        department: emp.department || "",
        position: emp.position || "",
        start_date: emp.start_date,
        employee_type: emp.employee_type,
        status: emp.status,
      });
    } else {
      setEditingId(null);
      setForm(EMPTY_FORM);
    }
    setError("");
    setOpenDialog(true);
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");
    try {
      if (editingId) {
        await api.patch(`/employees/${editingId}/`, form);
      } else {
        await api.post("/employees/", form);
      }
      setOpenDialog(false);
      fetchEmployees();
    } catch (err) {
      setError(JSON.stringify(err.response?.data || "Có lỗi xảy ra"));
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivate = async (id) => {
    if (!window.confirm("Ngưng hoạt động nhân viên này?")) return;
    await api.patch(`/employees/${id}/deactivate/`);
    fetchEmployees();
  };

  const handleExport = () => {
    const token = localStorage.getItem("access_token");
    fetch("http://127.0.0.1:8000/api/employees/export_excel/", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.blob())
      .then((blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "nhan_vien.xlsx";
        a.click();
        window.URL.revokeObjectURL(url);
      });
  };

  const statusColor = (s) => (s === "active" ? "success" : "default");
  const typeLabel = (t) => (t === "probation" ? "Thử việc" : "Chính thức");

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h5" fontWeight="bold">
          Quản lý Nhân viên
        </Typography>
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<FileDownloadIcon />}
            onClick={handleExport}
          >
            Xuất Excel
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpen()}
          >
            Thêm nhân viên
          </Button>
        </Box>
      </Box>

      <TextField
        placeholder="Tìm theo tên, mã, email, SĐT..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        sx={{ mb: 2, width: 400 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
      />

      {loading ? (
        <CircularProgress />
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: "#f5f5f5" }}>
                <TableCell>Mã NV</TableCell>
                <TableCell>Họ tên</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Phòng ban</TableCell>
                <TableCell>Chức vụ</TableCell>
                <TableCell>Loại</TableCell>
                <TableCell>Trạng thái</TableCell>
                <TableCell align="center">Thao tác</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {employees.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    Chưa có nhân viên nào
                  </TableCell>
                </TableRow>
              ) : (
                employees.map((emp) => (
                  <TableRow key={emp.id} hover>
                    <TableCell>{emp.code}</TableCell>
                    <TableCell>{emp.full_name}</TableCell>
                    <TableCell>{emp.email}</TableCell>
                    <TableCell>{emp.department_name || "—"}</TableCell>
                    <TableCell>{emp.position_name || "—"}</TableCell>
                    <TableCell>{typeLabel(emp.employee_type)}</TableCell>
                    <TableCell>
                      <Chip
                        label={emp.status === "active" ? "Đang làm" : "Đã nghỉ"}
                        color={statusColor(emp.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <IconButton
                        color="primary"
                        onClick={() => handleOpen(emp)}
                      >
                        <EditIcon />
                      </IconButton>
                      {emp.status === "active" && (
                        <IconButton
                          color="error"
                          onClick={() => handleDeactivate(emp.id)}
                        >
                          <BlockIcon />
                        </IconButton>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {editingId ? "Cập nhật nhân viên" : "Thêm nhân viên mới"}
        </DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 2,
              mt: 1,
            }}
          >
            <TextField
              label="Họ tên"
              value={form.full_name}
              onChange={(e) => setForm({ ...form, full_name: e.target.value })}
              required
            />
            <TextField
              label="Ngày sinh"
              type="date"
              value={form.date_of_birth}
              onChange={(e) =>
                setForm({ ...form, date_of_birth: e.target.value })
              }
              InputLabelProps={{ shrink: true }}
              required
            />
            <TextField
              label="Giới tính"
              select
              value={form.gender}
              onChange={(e) => setForm({ ...form, gender: e.target.value })}
            >
              <MenuItem value="M">Nam</MenuItem>
              <MenuItem value="F">Nữ</MenuItem>
            </TextField>
            <TextField
              label="CCCD"
              value={form.id_card}
              onChange={(e) => setForm({ ...form, id_card: e.target.value })}
              required
            />
            <TextField
              label="Email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
            <TextField
              label="Số điện thoại"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
            <TextField
              label="Phòng ban"
              select
              value={form.department}
              onChange={(e) => setForm({ ...form, department: e.target.value })}
            >
              <MenuItem value="">-- Chọn phòng ban --</MenuItem>
              {departments.map((d) => (
                <MenuItem key={d.id} value={d.id}>
                  {d.name}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Chức vụ"
              select
              value={form.position}
              onChange={(e) => setForm({ ...form, position: e.target.value })}
            >
              <MenuItem value="">-- Chọn chức vụ --</MenuItem>
              {positions.map((p) => (
                <MenuItem key={p.id} value={p.id}>
                  {p.name}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Ngày vào làm"
              type="date"
              value={form.start_date}
              onChange={(e) => setForm({ ...form, start_date: e.target.value })}
              InputLabelProps={{ shrink: true }}
              required
            />
            <TextField
              label="Loại nhân sự"
              select
              value={form.employee_type}
              onChange={(e) =>
                setForm({ ...form, employee_type: e.target.value })
              }
            >
              <MenuItem value="probation">Thử việc</MenuItem>
              <MenuItem value="official">Chính thức</MenuItem>
            </TextField>
            <TextField
              label="Địa chỉ"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              sx={{ gridColumn: "span 2" }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Hủy</Button>
          <Button variant="contained" onClick={handleSave} disabled={saving}>
            {saving ? <CircularProgress size={20} /> : "Lưu"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
