import { useEffect, useState } from "react";

export const useDashboardLogic = () => {
  const [stats, setStats] = useState({
    totalPatients: 0,
    eligible: 0,
    screened: 0,
    enrolled: 0,
  });

  const [recentPatients, setRecentPatients] = useState([]);
  const [loading, setLoading] = useState(false); // ✅ FIXED

  useEffect(() => {
    // temporarily no fetchLoa
  }, []);

  return {
    stats,
    recentPatients,
    loading,
  };
};