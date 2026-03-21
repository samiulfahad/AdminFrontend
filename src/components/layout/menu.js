import { LayoutDashboard, FlaskConical, SlidersHorizontal, BookOpen, MapPin } from "lucide-react";

const menu = [
  { label: "Home", path: "/", icon: LayoutDashboard },
  { label: "Labs", path: "/labs", icon: FlaskConical },
  { label: "Lab Management", path: "/lab-management", icon: SlidersHorizontal },
  { label: "Test Catalog", path: "/test-catalog", icon: BookOpen },
  { label: "Zones", path: "/zones", icon: MapPin },
];

export default menu;