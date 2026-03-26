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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  CircularProgress,
  Alert,
  InputAdornment,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import WarningIcon from "@mui/icons-material/Warning";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import SearchIcon from "@mui/icons-material/Search";

const EMPTY_FORM = {
  employee: "",
  contract_type: "probation",
  start_date: "",
  end_date: "",
  signed_date: "",
  salary: "",
  representative: "",
  note: "",
};

const TYPE_LABEL = {
  collaborator: "Cộng tác viên",
  probation: "Thử việc",
  official: "Chính thức",
};

const TYPE_COLOR = {
  collaborator: "default",
  probation: "warning",
  official: "success",
};

export default function ContractPage() {
  const [contracts, setContracts] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [filterExpiring, setFilterExpiring] = useState(false);
  const [filterEmployee, setFilterEmployee] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  const fetchContracts = async () => {
    try {
      const url = filterExpiring ? "/contracts/expiring_soon/" : "/contracts/";
      const res = await api.get(url);
      setContracts(res.data.results || res.data);
    } catch {
      setError("Không thể tải danh sách hợp đồng");
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    const res = await api.get("/employees/");
    setEmployees(res.data.results || res.data);
  };

  useEffect(() => {
    fetchEmployees();
  }, []);
  useEffect(() => {
    fetchContracts();
  }, [filterExpiring]);

  const getDaysLeft = (endDate) => {
    if (!endDate) return null;
    return Math.ceil((new Date(endDate) - new Date()) / (1000 * 60 * 60 * 24));
  };

  const filteredContracts = contracts.filter((c) => {
    const matchEmployee =
      filterEmployee === "" ||
      c.employee_name?.toLowerCase().includes(filterEmployee.toLowerCase()) ||
      c.employee_code?.toLowerCase().includes(filterEmployee.toLowerCase());
    const matchType = filterType === "" || c.contract_type === filterType;
    const matchStatus = (() => {
      if (filterStatus === "") return true;
      const days = getDaysLeft(c.end_date);
      if (filterStatus === "active") return c.end_date === null || days > 30;
      if (filterStatus === "expiring")
        return days !== null && days >= 0 && days <= 30;
      if (filterStatus === "expired") return days !== null && days < 0;
      return true;
    })();
    return matchEmployee && matchType && matchStatus;
  });

  const handleOpen = (contract = null) => {
    if (contract) {
      setEditingId(contract.id);
      setForm({
        employee: contract.employee,
        contract_type: contract.contract_type,
        start_date: contract.start_date,
        end_date: contract.end_date || "",
        signed_date: contract.signed_date,
        salary: contract.salary || "",
        representative: contract.representative || "",
        note: contract.note || "",
      });
    } else {
      setEditingId(null);
      setForm(EMPTY_FORM);
    }
    setFile(null);
    setError("");
    setOpenDialog(true);
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, val]) => {
        if (val !== "") formData.append(key, val);
      });
      if (file) formData.append("contract_file", file);
      const config = { headers: { "Content-Type": "multipart/form-data" } };
      if (editingId) {
        await api.patch(`/contracts/${editingId}/`, formData, config);
      } else {
        await api.post("/contracts/", formData, config);
      }
      setOpenDialog(false);
      fetchContracts();
    } catch (err) {
      setError(JSON.stringify(err.response?.data || "Có lỗi xảy ra"));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Xóa hợp đồng này?")) return;
    await api.delete(`/contracts/${id}/`);
    fetchContracts();
  };

  const getExpiryChip = (endDate) => {
    if (!endDate) return <Chip label="Không thời hạn" size="small" />;
    const days = getDaysLeft(endDate);
    if (days < 0) return <Chip label="Đã hết hạn" color="error" size="small" />;
    if (days <= 30)
      return (
        <Chip
          label={`Còn ${days} ngày`}
          color="warning"
          size="small"
          icon={<WarningIcon />}
        />
      );
    return <Chip label={endDate} size="small" variant="outlined" />;
  };

  const hasFilter = filterEmployee || filterType || filterStatus;

  return (
    <Box>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h5" fontWeight="bold">
          Quản lý Hợp đồng
        </Typography>
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button
            variant={filterExpiring ? "contained" : "outlined"}
            color="warning"
            startIcon={<WarningIcon />}
            onClick={() => setFilterExpiring(!filterExpiring)}
          >
            Sắp hết hạn
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpen()}
          >
            Thêm hợp đồng
          </Button>
        </Box>
      </Box>

      {/* Filter bar */}
      <Box
        sx={{
          display: "flex",
          gap: 2,
          mb: 2,
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        <TextField
          placeholder="Tìm nhân viên..."
          value={filterEmployee}
          onChange={(e) => setFilterEmployee(e.target.value)}
          size="small"
          sx={{ width: 220 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
        <TextField
          label="Loại hợp đồng"
          select
          size="small"
          value={filterType}
          sx={{ width: 200 }}
          onChange={(e) => setFilterType(e.target.value)}
        >
          <MenuItem value="">Tất cả loại</MenuItem>
          <MenuItem value="collaborator">Cộng tác viên</MenuItem>
          <MenuItem value="probation">Thử việc</MenuItem>
          <MenuItem value="official">Chính thức</MenuItem>
        </TextField>
        <TextField
          label="Trạng thái"
          select
          size="small"
          value={filterStatus}
          sx={{ width: 180 }}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <MenuItem value="">Tất cả</MenuItem>
          <MenuItem value="active">Còn hiệu lực</MenuItem>
          <MenuItem value="expiring">Sắp hết hạn</MenuItem>
          <MenuItem value="expired">Đã hết hạn</MenuItem>
        </TextField>
        {hasFilter && (
          <Button
            variant="text"
            color="error"
            onClick={() => {
              setFilterEmployee("");
              setFilterType("");
              setFilterStatus("");
            }}
          >
            Xóa filter
          </Button>
        )}
        <Typography variant="caption" color="text.secondary">
          {filteredContracts.length} hợp đồng
        </Typography>
      </Box>

      {/* Table */}
      {loading ? (
        <CircularProgress />
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: "#f5f5f5" }}>
                <TableCell>Nhân viên</TableCell>
                <TableCell>Loại HĐ</TableCell>
                <TableCell>Ngày ký</TableCell>
                <TableCell>Hiệu lực</TableCell>
                <TableCell>Hết hạn</TableCell>
                <TableCell>Lương HĐ</TableCell>
                <TableCell>Người ký</TableCell>
                <TableCell>File</TableCell>
                <TableCell align="center">Thao tác</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredContracts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} align="center">
                    Không có hợp đồng nào
                  </TableCell>
                </TableRow>
              ) : (
                filteredContracts.map((c) => (
                  <TableRow key={c.id} hover>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" fontWeight="bold">
                          {c.employee_name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {c.employee_code}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={TYPE_LABEL[c.contract_type]}
                        size="small"
                        color={TYPE_COLOR[c.contract_type]}
                      />
                    </TableCell>
                    <TableCell>{c.signed_date}</TableCell>
                    <TableCell>{c.start_date}</TableCell>
                    <TableCell>{getExpiryChip(c.end_date)}</TableCell>
                    <TableCell>
                      {c.salary
                        ? Number(c.salary).toLocaleString("vi-VN") + " đ"
                        : "—"}
                    </TableCell>
                    <TableCell>{c.representative || "—"}</TableCell>
                    <TableCell>
                      {c.contract_file ? (
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() =>
                            window.open(
                              `http://127.0.0.1:8000${c.contract_file}`,
                            )
                          }
                        >
                          <AttachFileIcon />
                        </IconButton>
                      ) : (
                        "—"
                      )}
                    </TableCell>
                    <TableCell align="center">
                      <IconButton color="primary" onClick={() => handleOpen(c)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        color="error"
                        onClick={() => handleDelete(c.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Dialog */}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {editingId ? "Cập nhật hợp đồng" : "Thêm hợp đồng mới"}
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
              label="Nhân viên"
              select
              value={form.employee}
              onChange={(e) => setForm({ ...form, employee: e.target.value })}
              required
              sx={{ gridColumn: "span 2" }}
            >
              <MenuItem value="">-- Chọn nhân viên --</MenuItem>
              {employees.map((e) => (
                <MenuItem key={e.id} value={e.id}>
                  {e.full_name} ({e.code})
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Loại hợp đồng"
              select
              value={form.contract_type}
              onChange={(e) =>
                setForm({ ...form, contract_type: e.target.value })
              }
            >
              <MenuItem value="collaborator">Cộng tác viên</MenuItem>
              <MenuItem value="probation">Thử việc</MenuItem>
              <MenuItem value="official">Chính thức</MenuItem>
            </TextField>
            <TextField
              label="Người ký (đại diện công ty)"
              value={form.representative}
              onChange={(e) =>
                setForm({ ...form, representative: e.target.value })
              }
            />
            <TextField
              label="Ngày ký"
              type="date"
              value={form.signed_date}
              onChange={(e) =>
                setForm({ ...form, signed_date: e.target.value })
              }
              InputLabelProps={{ shrink: true }}
              required
            />
            <TextField
              label="Lương trong HĐ"
              type="number"
              value={form.salary}
              onChange={(e) => setForm({ ...form, salary: e.target.value })}
            />
            <TextField
              label="Ngày bắt đầu"
              type="date"
              value={form.start_date}
              onChange={(e) => setForm({ ...form, start_date: e.target.value })}
              InputLabelProps={{ shrink: true }}
              required
            />
            <TextField
              label="Ngày hết hạn (để trống nếu không thời hạn)"
              type="date"
              value={form.end_date}
              onChange={(e) => setForm({ ...form, end_date: e.target.value })}
              InputLabelProps={{ shrink: true }}
            />
            <Box sx={{ gridColumn: "span 2" }}>
              <Typography variant="caption" color="text.secondary">
                File hợp đồng (PDF)
              </Typography>
              <input
                type="file"
                accept=".pdf"
                onChange={(e) => setFile(e.target.files[0])}
                style={{ display: "block", marginTop: 4 }}
              />
            </Box>
            <TextField
              label="Ghi chú / điều khoản đặc biệt"
              value={form.note}
              multiline
              rows={3}
              onChange={(e) => setForm({ ...form, note: e.target.value })}
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
