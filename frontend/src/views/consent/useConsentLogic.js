import { useState, useEffect } from "react";

export const useConsentLogic = (currentUser) => {
  const [selectedPatient, setSelectedPatient] = useState("");
  const [language, setLanguage] = useState("english");
  const [consentGenerated, setConsentGenerated] = useState(false);
  const [selectedPatientData, setSelectedPatientData] = useState(null);
  const [decision, setDecision] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  const role = currentUser?.role;

  // 🔹 Simulated patients (replace later with Supabase fetch if needed)
  const patients = [
    { id: "P001", age: 52, sex: "M" },
    { id: "P002", age: 45, sex: "F" },
    { id: "P003", age: 58, sex: "M" },
    { id: "P004", age: 41, sex: "F" },
  ];

  // 🔹 Determine effective patient ID
  const effectivePatientId =
    role === "patient" ? currentUser?.patient_id : selectedPatient;

  // 🔹 Auto-load patient data
  useEffect(() => {
    if (!effectivePatientId) {
      setSelectedPatientData(null);
      return;
    }

    const patient = patients.find(
      (p) => p.id === effectivePatientId
    );

    setSelectedPatientData(patient || null);
  }, [effectivePatientId]);

  // 🔹 Generate Consent (Backend Call)
  const handleGenerateConsent = async ({
    notes,
    complexity,
  }) => {
    if (!effectivePatientId) {
      alert("Please select a patient");
      return;
    }

    try {
      const response = await fetch(
        "http://localhost:8000/consent/generate",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            patient_id: effectivePatientId,
            language,
            literacy_level: complexity,
            notes,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Failed to generate consent");
      }

      setConsentGenerated(true);
      alert("Consent generated successfully!");

    } catch (error) {
      console.error(error);
      alert("Error generating consent.");
    }
  };

  // 🔹 Upload Signed Consent
  const handleUploadSigned = async () => {
    if (!selectedFile) {
      alert("Please upload signed consent file");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const response = await fetch(
        `http://localhost:8000/consent/upload-signed/${effectivePatientId}`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      alert("Consent submitted successfully!");

    } catch (error) {
      console.error(error);
      alert("Error uploading signed consent.");
    }
  };

  // 🔹 Decline Consent
  const handleDecline = async () => {
    try {
      await fetch(
        `http://localhost:8000/consent/decline/${effectivePatientId}`,
        {
          method: "POST",
        }
      );

      alert("Consent declined.");

    } catch (error) {
      console.error(error);
      alert("Error declining consent.");
    }
  };

  // 🔹 Download Placeholder
  const handleDownload = () => {
    alert(
      "Consent form download feature.\n(You can later connect this to generated PDF URL.)"
    );
  };

  // 🔹 Consent Templates (Preview Only)
  const consentTemplates = {
    english: {
      title: "INFORMED CONSENT FORM",
      subtitle: "Clinical Trial for Type 2 Diabetes Treatment",
      sections: [
        {
          heading: "Purpose of the Study",
          content:
            "You are invited to participate in a study evaluating treatment options for Type 2 Diabetes.",
        },
        {
          heading: "Study Duration",
          content:
            "Participation lasts approximately 6 months with regular follow-ups.",
        },
        {
          heading: "Risks",
          content:
            "Possible risks include nausea, dizziness, and minor discomfort.",
        },
        {
          heading: "Confidentiality",
          content:
            "All personal and medical information will remain confidential.",
        },
      ],
    },
    hindi: {
      title: "सूचित सहमति पत्र",
      subtitle: "टाइप 2 मधुमेह उपचार परीक्षण",
      sections: [
        {
          heading: "अध्ययन का उद्देश्य",
          content:
            "आपको टाइप 2 मधुमेह के उपचार परीक्षण में भाग लेने के लिए आमंत्रित किया जाता है।",
        },
      ],
    },
    malayalam: {
      title: "അറിവുള്ള സമ്മത ഫോം",
      subtitle: "ടൈപ്പ് 2 പ്രമേഹ ചികിത്സാ പരീക്ഷണം",
      sections: [
        {
          heading: "പഠനത്തിന്റെ ഉദ്ദേശ്യം",
          content:
            "ടൈപ്പ് 2 പ്രമേഹ ചികിത്സാ പരീക്ഷണത്തിൽ പങ്കെടുക്കാൻ നിങ്ങളെ ക്ഷണിക്കുന്നു.",
        },
      ],
    },
  };

  return {
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
    decision,
    setDecision,
    selectedFile,
    setSelectedFile,
    handleUploadSigned,
    handleDecline,
  };
};