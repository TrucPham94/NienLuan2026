// sidebar + header chung
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  AppBar,
  Typography,
  IconButton,
  Avatar,
  Divider,
} from "@mui/material";
import PeopleIcon from "@mui/icons-material/People";
import ApartmentIcon from "@mui/icons-material/Apartment";
import DescriptionIcon from "@mui/icons-material/Description";
import PaymentsIcon from "@mui/icons-material/Payments";
import DashboardIcon from "@mui/icons-material/Dashboard";
import LogoutIcon from "@mui/icons-material/Logout";

const DRAWER_WIDTH = 240;

const menuItems = [
  { text: "Dashboard", icon: <DashboardIcon />, path: "/" },
  { text: "Nhân viên", icon: <PeopleIcon />, path: "/employees" },
  { text: "Phòng ban", icon: <ApartmentIcon />, path: "/departments" },
  { text: "Hợp đồng", icon: <DescriptionIcon />, path: "/contracts" },
  { text: "Lương", icon: <PaymentsIcon />, path: "/salaries" },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <Box sx={{ display: "flex" }}>
      {/* Sidebar */}
      <Drawer
        variant="permanent"
        sx={{
          width: DRAWER_WIDTH,
          "& .MuiDrawer-paper": {
            width: DRAWER_WIDTH,
            boxSizing: "border-box",
          },
        }}
      >
        <Toolbar sx={{ justifyContent: "center", py: 2 }}>
          <Typography variant="h6" fontWeight="bold" color="primary">
            HRM System
          </Typography>
        </Toolbar>
        <Divider />
        <List>
          {menuItems.map((item) => (
            <ListItem key={item.path} disablePadding>
              <ListItemButton
                selected={location.pathname === item.path}
                onClick={() => navigate(item.path)}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
        <Divider />
        <List sx={{ mt: "auto" }}>
          <ListItem disablePadding>
            <ListItemButton onClick={logout}>
              <ListItemIcon>
                <LogoutIcon />
              </ListItemIcon>
              <ListItemText primary="Đăng xuất" />
            </ListItemButton>
          </ListItem>
        </List>
      </Drawer>

      {/* Main content */}
      <Box sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>
        <AppBar position="static" color="default" elevation={1}>
          <Toolbar>
            <Typography variant="h6" sx={{ flexGrow: 1 }}>
              Quản lý Nhân sự
            </Typography>
            <Avatar
              sx={{ bgcolor: "primary.main", mr: 1, width: 32, height: 32 }}
            >
              {user?.username?.[0]?.toUpperCase()}
            </Avatar>
            <Typography variant="body2">{user?.username}</Typography>
          </Toolbar>
        </AppBar>
        <Box sx={{ p: 3, flexGrow: 1 }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
