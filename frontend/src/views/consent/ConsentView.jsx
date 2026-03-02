import React, { useState } from "react";
import { FileText, CheckCircle } from "lucide-react";
import { useConsentLogic } from "./useConsentLogic";

const ConsentView = ({ currentUser }) => {
  const {
    selectedPatient,
    setSelectedPatient,
    language,
    setLanguage,
    consentGenerated,
    patients,
    consentTemplates,
    selectedPatientData,
    handleGenerateConsent,
    handleDownload,
  } = useConsentLogic(currentUser);

  const role = currentUser?.role;
  const patientId = currentUser?.patient_id;

  const [notes, setNotes] = useState("");
  const [complexity, setComplexity] = useState("simple");
  const [uploadedImage, setUploadedImage] = useState(null);

  const currentContent = consentTemplates[language];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">
        Consent Form Generation
      </h2>

      <div className="bg-white rounded-xl shadow-sm p-6 space-y-6">

        {/* Doctor/Admin Patient Selection */}
        {role !== "patient" && (
          <select
            value={selectedPatient}
            onChange={(e) => setSelectedPatient(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg"
          >
            <option value="">-- Select Patient --</option>
            {patients.map((p) => (
              <option key={p.id} value={p.id}>
                {p.id} - Age {p.age}
              </option>
            ))}
          </select>
        )}

        {/* Patient Auto ID */}
        {role === "patient" && (
          <div className="bg-blue-50 p-3 rounded-lg text-sm">
            <strong>Patient ID:</strong> {patientId}
          </div>
        )}

        {/* Language */}
        <div className="flex gap-3">
          {["english", "hindi", "malayalam"].map((lang) => (
            <button
              key={lang}
              onClick={() => setLanguage(lang)}
              className={`px-4 py-2 rounded-lg ${
                language === lang
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200"
              }`}
            >
              {lang}
            </button>
          ))}
        </div>

        {/* Simple / Technical */}
        <div>
          <label className="block font-semibold mb-2">
            Consent Type
          </label>
          <div className="flex gap-4">
            <button
              onClick={() => setComplexity("simple")}
              className={`px-4 py-2 rounded-lg ${
                complexity === "simple"
                  ? "bg-green-600 text-white"
                  : "bg-gray-200"
              }`}
            >
              Simple
            </button>

            <button
              onClick={() => setComplexity("technical")}
              className={`px-4 py-2 rounded-lg ${
                complexity === "technical"
                  ? "bg-purple-600 text-white"
                  : "bg-gray-200"
              }`}
            >
              Technical
            </button>
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block font-semibold mb-2">
            Additional Clinical Notes
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full border rounded-lg px-4 py-2 h-28 resize-none"
          />
        </div>

        {/* Image Upload */}
        <div>
          <label className="block font-semibold mb-2">
            Upload Supporting Document
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setUploadedImage(e.target.files[0])}
            className="w-full border rounded-lg px-3 py-2"
          />
        </div>

        {/* Buttons Section */}
<div className="flex flex-col gap-4">

  {/* Bigger Generate Consent Button */}
  <button
    onClick={() =>
      handleGenerateConsent({
        notes,
        complexity,
        uploadedImage,
      })
    }
className="bg-blue-600 text-white px-6 py-3 rounded-lg flex items-center gap-2 hover:bg-blue-700"
  >
    <FileText size={22} />
    Generate Consent
  </button>

  {/* Upload Signed Consent (Only Patient) */}
  {role === "patient" && (
    <div>
      <label className="block font-semibold mb-2">
        Upload Signed Consent
      </label>

      <input
        type="file"
        accept=".pdf,image/*"
        className="w-full border rounded-lg px-2 py-2"
      />

      <button
        className="mt-3 bg-green-600 text-white py-3 rounded-lg w-full hover:bg-green-700 transition"
      >
        Submit Signed Consent
      </button>
    </div>
  )}
</div>
      </div>

      {/* Preview */}
      {consentGenerated && selectedPatientData && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex justify-between mb-4">
            <h3 className="font-semibold">Preview</h3>
            <button
              onClick={handleDownload}
              className="text-blue-600 flex items-center gap-1"
            >
              <CheckCircle size={16} />
              Download PDF
            </button>
          </div>

          <div className="space-y-4">
            <h4 className="text-center font-bold">
              {currentContent.title}
            </h4>
            <p className="text-center text-sm">
              {currentContent.subtitle}
            </p>

            <div className="text-sm">
              <p><strong>Patient ID:</strong> {patientId}</p>
              <p><strong>Age:</strong> {selectedPatientData.age}</p>
              <p><strong>Sex:</strong> {selectedPatientData.sex}</p>
              <p><strong>Date:</strong> {new Date().toLocaleDateString("en-IN")}</p>
              <p><strong>Consent Type:</strong> {complexity}</p>
            </div>

            {currentContent.sections.map((section, i) => (
              <div key={i}>
                <h5 className="font-semibold">{section.heading}</h5>
                <p className="text-gray-700">{section.content}</p>
              </div>
            ))}

            {notes && (
              <div>
                <h5 className="font-semibold">Additional Notes</h5>
                <p className="text-gray-700">{notes}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ConsentView;