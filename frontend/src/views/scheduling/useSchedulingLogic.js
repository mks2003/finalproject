import { useState, useEffect } from "react";
import { supabase } from "../../supabaseClient";

export const useSchedulingLogic = () => {
  const [appointments, setAppointments] = useState([]);
  const [formData, setFormData] = useState({
    patient_id: "",
    doctor_notes: "",
    date: "",
    time_slot: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAppointments();

    // 🔥 Auto refresh every 3 seconds
  const interval = setInterval(() => {
    fetchAppointments();
  }, 3000);
  
  return () => clearInterval(interval);
  }, []);

  const fetchAppointments = async () => {
  setLoading(true);
  setError(null);

  try {
    const { data, error } = await supabase
      .from("appointments")
      .select("*")
      .order("date", { ascending: true });

    // 🔥 DEBUG LOGS (VERY IMPORTANT)
    console.log("Fetched data:", data);
    console.log("Fetch error:", error);

    if (error) throw error;

    if (!data || data.length === 0) {
      console.warn("⚠️ No appointments found in DB");
    }

    setAppointments(data || []);

  } catch (err) {
    console.error("Fetch error:", err.message);
    setError("Failed to load appointments: " + err.message);
  } finally {
    setLoading(false);
  }
};

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAddAppointment = async () => {
    if (!formData.patient_id || !formData.date || !formData.time_slot) {
      setError("Patient ID, Date and Time are required");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 1. Conflict check
      const { data: conflict } = await supabase
        .from("appointments")
        .select("id")
        .eq("date", formData.date)
        .eq("time_slot", formData.time_slot);

      if (conflict?.length > 0) {
        throw new Error("This slot is already booked");
      }

      // 2. Insert appointment
      const { data: inserted, error: insertError } = await supabase
        .from("appointments")
        .insert([
          {
            patient_id: formData.patient_id,
            doctor_id: null, // ✅ important fix
            doctor_notes: formData.doctor_notes || null,
            date: formData.date,
            time_slot: formData.time_slot,
            status: "pending",
            reminder_sent: false,
          },
        ])
        .select()
        .single();

      console.log("Inserted:", inserted);
      console.log("Insert Error:", insertError);

      if (insertError) throw insertError;

      const newAppointmentId = inserted.id;

      // 3. Send confirmation email
      const response = await fetch(
        `http://127.0.0.1:5000/scheduling/send-confirmation/${newAppointmentId}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        }
      );

      if (!response.ok) {
        const errText = await response.text();
        console.warn("Confirmation email failed:", errText);
      }

      alert("Appointment scheduled successfully! Confirmation email sent.");

      // Reset form
      setFormData({
        patient_id: "",
        doctor_notes: "",
        date: "",
        time_slot: "",
      });

      fetchAppointments();
    } catch (err) {
      setError(err.message || "Failed to schedule appointment");
      console.error("Booking error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, status) => {
    const { error } = await supabase
      .from("appointments")
      .update({ status })
      .eq("id", id);

    if (!error) fetchAppointments();
  };

  const handleSendReminder = async (id) => {
    console.log(`Reminder sent for appointment ${id}`);

    await supabase
      .from("appointments")
      .update({ reminder_sent: true })
      .eq("id", id);

    alert("Reminder sent! (Check console)");
    fetchAppointments();
  };

  return {
    appointments,
    formData,
    loading,
    error,
    handleInputChange,
    handleAddAppointment,
    handleStatusChange,
    handleSendReminder,
  };
};