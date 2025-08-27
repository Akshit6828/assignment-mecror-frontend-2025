import { useEffect, useState } from "react";
import { candidates } from "../../data/applied-candidates";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
} from "recharts";
import "./analytics-page.scss";

export default function AnalyticsPage() {
  const [roleData, setRoleData] = useState<any[]>([]);
  const [locationData, setLocationData] = useState<any[]>([]);
  const [salaryData, setSalaryData] = useState<any[]>([]);
  const [skillData, setSkillData] = useState<any[]>([]);

  useEffect(() => {
    prepareAnalytics();
  }, []);

  const prepareAnalytics = () => {
    // Roles distribution
    const roleCount: Record<string, number> = {};
    candidates.forEach((c) =>
      c.work_experiences.forEach((we: any) => {
        roleCount[we.roleName] = (roleCount[we.roleName] || 0) + 1;
      })
    );

    const sortedRoles = Object.entries(roleCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);

    setRoleData(
      sortedRoles.map(([role, count]) => ({
        name: role,
        value: count,
      }))
    );

    // Location distribution
    const locationCount: Record<string, number> = {};
    candidates.forEach((c) => {
      locationCount[c.location] = (locationCount[c.location] || 0) + 1;
    });
    setLocationData(
      Object.entries(locationCount).map(([location, count]) => ({
        name: location,
        value: count,
      }))
    );

    // Salary distribution (in USD buckets)
    const salaries = candidates
      .map((c) => c.annual_salary_expectation["full-time"])
      .filter(Boolean)
      .map((s) => parseInt(s.replace(/\D/g, "")));

    const buckets = {
      "$0-50k": 0,
      "$50k-100k": 0,
      "$100k-150k": 0,
      "$150k+": 0,
    };

    salaries.forEach((s) => {
      if (s <= 50000) buckets["$0-50k"]++;
      else if (s <= 100000) buckets["$50k-100k"]++;
      else if (s <= 150000) buckets["$100k-150k"]++;
      else buckets["$150k+"]++;
    });

    setSalaryData(
      Object.entries(buckets).map(([range, count]) => ({
        range,
        value: count,
      }))
    );

    // Top 5 Skills distribution
    const skillCount: Record<string, number> = {};
    candidates.forEach((c) =>
      c.skills.forEach((skill: string) => {
        skillCount[skill] = (skillCount[skill] || 0) + 1;
      })
    );

    const sortedSkills = Object.entries(skillCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    setSkillData(
      sortedSkills.map(([skill, count]) => ({
        name: skill,
        value: count,
      }))
    );
  };

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#845EC2"];

  return (
    <div className="analytics-page">
      <h1>Analytics Dashboard</h1>

      {/* Roles Pie Chart */}
      <div className="chart-container">
        <h2>Role Distribution</h2>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={roleData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) =>
                `${name} ${((percent || 0) * 100).toFixed(0)}%`
              }
              outerRadius={120}
              dataKey="value"
            >
              {roleData.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Location Bar Chart */}
      <div className="chart-container">
        <h2>Location Distribution</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={locationData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="value" fill="#82ca9d" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Salary Distribution */}
      <div className="chart-container">
        <h2>Salary Distribution (in USD)</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={salaryData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="range" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="value" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Top 5 Skills */}
      <div className="chart-container">
        <h2>Top 5 Skills</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={skillData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="value" fill="#FF8042" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
