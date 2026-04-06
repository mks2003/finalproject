import React from "react";
import { Calendar, CheckCircle, Clock, Send, AlertCircle } from "lucide-react";
import { useSchedulingLogic } from "./useSchedulingLogic";

const SchedulingView = ({ currentUser }) => {
  const role = currentUser?.role || "unknown";

  const {
    appointments,
    formData,
    loading,
    error,
    handleInputChange,
    handleAddAppointment,
    handleStatusChange,
    handleSendReminder,
  } = useSchedulingLogic();

  return (
    <div className="space-y-8 p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <Calendar className="text-green-600" size={32} />
          {role === "patient" ? "Book Your Appointment" : "Appointment Scheduling & Communication"}
        </h2>

        {role === "doctor" && (
          <span className="text-sm text-gray-600">
            Logged in as {currentUser?.name || "Doctor"}
          </span>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg flex items-center gap-3">
          <AlertCircle className="text-red-600" size={24} />
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* PATIENT VIEW - Booking Form Only (Doctor Notes removed) */}
      {role === "patient" && (
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h3 className="text-2xl font-semibold text-gray-800 mb-6">
            Schedule New Appointment
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Patient ID <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="patient_id"
                placeholder="P001"
                value={formData.patient_id}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Time Slot <span className="text-red-500">*</span>
              </label>
              <input
                type="time"
                name="time_slot"
                value={formData.time_slot}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                required
              />
            </div>

            {/* Doctor Notes section removed completely */}
          </div>

          <button
            onClick={handleAddAppointment}
            disabled={loading}
            className={`mt-8 w-full py-4 rounded-xl font-bold text-lg transition-all ${
              loading
                ? "bg-gray-400 cursor-not-allowed text-white"
                : "bg-green-600 hover:bg-green-700 text-white shadow-md"
            }`}
          >
            {loading ? "Scheduling..." : "Schedule Appointment"}
          </button>
        </div>
      )}

      {/* DOCTOR VIEW - Full Appointment List */}
      {role === "doctor" && (
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h3 className="text-2xl font-semibold text-gray-800 mb-6">
            All Scheduled Appointments
          </h3>

          {loading && !appointments.length ? (
            <div className="text-center py-12 text-gray-500">Loading appointments...</div>
          ) : appointments.length === 0 ? (
            <div className="text-center py-12 text-gray-500">No appointments scheduled yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left py-4 px-6 font-semibold">Patient ID</th>
                    <th className="text-left py-4 px-6 font-semibold">Date</th>
                    <th className="text-left py-4 px-6 font-semibold">Time Slot</th>
                    <th className="text-left py-4 px-6 font-semibold">Status</th>
                    <th className="text-left py-4 px-6 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.map((appt) => (
                    <tr key={appt.id} className="border-b hover:bg-gray-50 transition">
                      <td className="py-4 px-6 font-medium">{appt.patient_id}</td>
                      <td className="py-4 px-6">
                        {new Date(appt.date).toLocaleDateString("en-IN")}
                      </td>
                      <td className="py-4 px-6">{appt.time_slot}</td>
                      <td className="py-4 px-6">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            appt.status === "confirmed"
                              ? "bg-green-100 text-green-800"
                              : appt.status === "pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {appt.status.charAt(0).toUpperCase() + appt.status.slice(1)}
                        </span>
                      </td>
                      <td className="py-4 px-6 flex items-center gap-4">
                        {appt.status === "pending" && (
                          <button
                            onClick={() => handleStatusChange(appt.id, "confirmed")}
                            className="text-green-600 hover:text-green-800 flex items-center gap-1 text-sm font-medium"
                          >
                            <CheckCircle size={16} />
                            Confirm
                          </button>
                        )}

                        {appt.status === "confirmed" && (
                          <button
                            onClick={() => handleSendReminder(appt.id)}
                            className="text-blue-600 hover:text-blue-800 flex items-center gap-1 text-sm font-medium"
                            disabled={appt.reminder_sent}
                          >
                            <Send size={16} />
                            {appt.reminder_sent ? "Reminder Sent" : "Send Reminder"}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SchedulingView;