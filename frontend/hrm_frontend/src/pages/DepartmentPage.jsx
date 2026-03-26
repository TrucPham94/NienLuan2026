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
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Tabs,
  Tab,
  Alert,
  CircularProgress,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

const EMPTY_DEPT = { name: "", code: "" };
const EMPTY_POS = { name: "", code: "", salary_coefficient: 1.0 };

export default function DepartmentPage() {
  const [tab, setTab] = useState(0);
  const [departments, setDepartments] = useState([]);
  const [positions, setPositions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_DEPT);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchDepartments = async () => {
    const res = await api.get("/departments/");
    setDepartments(res.data.results || res.data);
    setLoading(false);
  };

  const fetchPositions = async () => {
    const res = await api.get("/departments/positions/");
    setPositions(res.data.results || res.data);
  };

  useEffect(() => {
    fetchDepartments();
    fetchPositions();
  }, []);

  const isDept = tab === 0;

  const handleOpen = (item = null) => {
    if (item) {
      setEditingId(item.id);
      setForm(
        isDept
          ? { name: item.name, code: item.code }
          : {
              name: item.name,
              code: item.code,
              salary_coefficient: item.salary_coefficient,
            },
      );
    } else {
      setEditingId(null);
      setForm(isDept ? EMPTY_DEPT : EMPTY_POS);
    }
    setError("");
    setOpenDialog(true);
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");
    try {
      const url = isDept ? "/departments/" : "/departments/positions/";
      if (editingId) {
        await api.patch(`${url}${editingId}/`, form);
      } else {
        await api.post(url, form);
      }
      setOpenDialog(false);
      isDept ? fetchDepartments() : fetchPositions();
    } catch (err) {
      setError(JSON.stringify(err.response?.data || "Có lỗi xảy ra"));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Xóa mục này?")) return;
    const url = isDept
      ? `/departments/${id}/`
      : `/departments/positions/${id}/`;
    await api.delete(url);
    isDept ? fetchDepartments() : fetchPositions();
  };

  const data = isDept ? departments : positions;

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
          Phòng ban & Chức vụ
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpen()}
        >
          {isDept ? "Thêm phòng ban" : "Thêm chức vụ"}
        </Button>
      </Box>

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
        <Tab label="Phòng ban" />
        <Tab label="Chức vụ" />
      </Tabs>

      {loading ? (
        <CircularProgress />
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: "#f5f5f5" }}>
                <TableCell>Mã</TableCell>
                <TableCell>Tên</TableCell>
                {isDept ? (
                  <TableCell>Số nhân viên</TableCell>
                ) : (
                  <TableCell>Hệ số lương</TableCell>
                )}
                <TableCell align="center">Thao tác</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    Chưa có {isDept ? "phòng ban" : "chức vụ"} nào
                  </TableCell>
                </TableRow>
              ) : (
                data.map((item) => (
                  <TableRow key={item.id} hover>
                    <TableCell>{item.code}</TableCell>
                    <TableCell>{item.name}</TableCell>
                    <TableCell>
                      {isDept
                        ? (item.employee_count ?? 0)
                        : item.salary_coefficient}
                    </TableCell>
                    <TableCell align="center">
                      <IconButton
                        color="primary"
                        onClick={() => handleOpen(item)}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        color="error"
                        onClick={() => handleDelete(item.id)}
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

      {/* Dialog thêm/sửa */}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>
          {editingId
            ? `Cập nhật ${isDept ? "phòng ban" : "chức vụ"}`
            : `Thêm ${isDept ? "phòng ban" : "chức vụ"} mới`}
        </DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
            <TextField
              label="Mã"
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value })}
              required
            />
            <TextField
              label="Tên"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
            {!isDept && (
              <TextField
                label="Hệ số lương"
                type="number"
                value={form.salary_coefficient}
                onChange={(e) =>
                  setForm({ ...form, salary_coefficient: e.target.value })
                }
                inputProps={{ step: 0.1, min: 0 }}
              />
            )}
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
