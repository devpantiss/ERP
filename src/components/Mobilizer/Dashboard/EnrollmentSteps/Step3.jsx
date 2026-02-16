import React, { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Lottie from "lottie-react";
import {
  FaCalendarAlt,
  FaIdCard,
  FaUser,
  FaBriefcase,
  FaUpload,
} from "react-icons/fa";
import { AiOutlineClose } from "react-icons/ai";
import { saveEnrollmentStep } from "../../../utils/enrollmentStorage";

export default function Step3({ value = {}, onChange, onValidChange }) {
  /* ===================== STATE ===================== */

  const [formData, setFormData] = useState({
    fullName: value.fullName || "",
    dateOfBirth: value.dateOfBirth || null,
    gender: value.gender || "",
    aadharNumber: value.aadharNumber || "",
    aadharFile: value.aadharFile || null,

    qualificationLevel: value.qualificationLevel || "",
    qualificationTrade: value.qualificationTrade || "",
    qualificationInstitute: value.qualificationInstitute || "",
    qualificationYear: value.qualificationYear || "",
    qualificationCert: value.qualificationCert || null,

    experienceYears: value.experienceYears || "",
    experienceCert: value.experienceCert || null,
    licenseCert: value.licenseCert || null,
    currentlyEmployed: value.currentlyEmployed || "",
  });

  const [previews, setPreviews] = useState({});
  const [isDeclarationChecked, setIsDeclarationChecked] = useState(
    value.declarationAccepted || false
  );
  const [animationData, setAnimationData] = useState(null);

  const isOperatorRole =
    value?.role?.toLowerCase()?.includes("operator");

  /* ===================== LOAD LOTTIE ===================== */

  useEffect(() => {
    fetch("/info.json")
      .then((res) => res.json())
      .then(setAnimationData)
      .catch(console.error);
  }, []);

  /* ===================== HELPERS ===================== */

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  };

  const handleDateChange = (date) => {
    setFormData((p) => ({ ...p, dateOfBirth: date }));
  };

  const handleFile = (key, file) => {
    if (!file) return;
    setFormData((p) => ({ ...p, [key]: file }));
    setPreviews((p) => ({ ...p, [key]: URL.createObjectURL(file) }));
  };

  const removeFile = (key) => {
    setFormData((p) => ({ ...p, [key]: null }));
    setPreviews((p) => ({ ...p, [key]: null }));
  };

  const calculateAge = (dob) => {
    if (!dob) return null;
    return new Date(Date.now() - dob.getTime()).getUTCFullYear() - 1970;
  };

  /* ===================== SYNC & VALIDATION ===================== */

  useEffect(() => {
    const payload = {
      ...formData,
      declarationAccepted: isDeclarationChecked,
    };

    onChange(payload);

    onValidChange(
      Boolean(
        formData.fullName &&
          formData.dateOfBirth &&
          formData.gender &&
          formData.aadharNumber &&
          formData.aadharFile &&
          formData.qualificationLevel &&
          formData.qualificationTrade &&
          formData.qualificationCert &&
          (!isOperatorRole || formData.licenseCert) &&
          isDeclarationChecked
      )
    );

    saveEnrollmentStep("basic", payload);
  }, [formData, isDeclarationChecked]);

  /* ===================== UI ===================== */

  return (
    <div className="flex w-full gap-10 text-slate-200 h-[calc(100vh-96px)]">

      {/* ================= FORM (SCROLLABLE) ================= */}
      <div className="w-full lg:w-2/3 bg-[#020617] border border-yellow-400 rounded-2xl p-8 space-y-8 overflow-y-auto">

        <h2 className="text-2xl font-semibold text-yellow-400">
          Basic & Qualification Information
        </h2>

        <Field
          icon={<FaUser />}
          label="Full Name"
          name="fullName"
          value={formData.fullName}
          onChange={handleInputChange}
          placeholder="As per Aadhaar"
        />

        {/* DOB + GENDER */}
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="text-sm text-slate-400 mb-1 block">
              Date of Birth
            </label>
            <div className="relative">
              <FaCalendarAlt className="absolute left-3 top-3 text-slate-400" />
              <DatePicker
                selected={formData.dateOfBirth}
                onChange={handleDateChange}
                maxDate={new Date()}
                className="w-full pl-10 pr-3 py-2 rounded-lg
                  bg-[#0b0f14] border border-yellow-400
                  text-slate-200 outline-none"
              />
            </div>
            {formData.dateOfBirth && (
              <p className="text-xs text-slate-400 mt-1">
                Age: {calculateAge(formData.dateOfBirth)}
              </p>
            )}
          </div>

          <Select
            label="Gender"
            name="gender"
            value={formData.gender}
            onChange={handleInputChange}
            options={["Male", "Female", "Others"]}
          />
        </div>

        <Field
          icon={<FaIdCard />}
          label="Aadhaar Number"
          name="aadharNumber"
          value={formData.aadharNumber}
          onChange={handleInputChange}
          placeholder="12-digit Aadhaar number"
        />

        <Upload
          label="Upload Aadhaar Card"
          preview={previews.aadharFile}
          onUpload={(f) => handleFile("aadharFile", f)}
          onRemove={() => removeFile("aadharFile")}
        />

        {/* ================= QUALIFICATION ================= */}
        <div className="pt-6 border-t border-yellow-400 space-y-4">
          <h3 className="text-lg font-medium text-yellow-400 flex items-center gap-2">
            <FaBriefcase /> Highest Qualification
          </h3>

          <Select
            label="Qualification Level"
            name="qualificationLevel"
            value={formData.qualificationLevel}
            onChange={handleInputChange}
            options={[
              "Below 10th",
              "10th Pass",
              "12th Pass",
              "ITI",
              "Diploma",
              "Graduate",
              "Post Graduate",
            ]}
          />

          <Field
            label="Trade / Discipline"
            name="qualificationTrade"
            value={formData.qualificationTrade}
            onChange={handleInputChange}
            placeholder="Electrician / Fitter / Welder"
          />

          <Field
            label="Institute / Board"
            name="qualificationInstitute"
            value={formData.qualificationInstitute}
            onChange={handleInputChange}
            placeholder="ITI Angul / CBSE / Govt Polytechnic"
          />

          <Field
            label="Year of Passing"
            name="qualificationYear"
            value={formData.qualificationYear}
            onChange={handleInputChange}
            placeholder="e.g. 2021"
          />

          <Upload
            label="Qualification Certificate"
            preview={previews.qualificationCert}
            onUpload={(f) => handleFile("qualificationCert", f)}
            onRemove={() => removeFile("qualificationCert")}
          />
        </div>

        {/* ================= PROFESSIONAL ================= */}
        <div className="pt-6 border-t border-yellow-400 space-y-4">
          <h3 className="text-lg font-medium text-yellow-400">
            Professional Details
          </h3>

          <Field
            label="Years of Experience"
            name="experienceYears"
            value={formData.experienceYears}
            onChange={handleInputChange}
            placeholder="e.g. 3"
          />

          <Select
            label="Currently Employed"
            name="currentlyEmployed"
            value={formData.currentlyEmployed}
            onChange={handleInputChange}
            options={["Yes", "No"]}
          />

          {isOperatorRole && (
            <Upload
              label="Operator / Driving License"
              preview={previews.licenseCert}
              onUpload={(f) => handleFile("licenseCert", f)}
              onRemove={() => removeFile("licenseCert")}
            />
          )}

          <Upload
            label="Experience Certificate (Optional)"
            preview={previews.experienceCert}
            onUpload={(f) => handleFile("experienceCert", f)}
            onRemove={() => removeFile("experienceCert")}
          />
        </div>

        {/* DECLARATION */}
        <div className="flex items-start gap-2 pt-2">
          <input
            type="checkbox"
            checked={isDeclarationChecked}
            onChange={() => setIsDeclarationChecked(!isDeclarationChecked)}
            className="mt-1 accent-yellow-400"
          />
          <p className="text-sm text-slate-400">
            I confirm that the above information is true and correct.
          </p>
        </div>
      </div>

      {/* ================= ANIMATION (FIXED / STICKY) ================= */}
      <div className="hidden lg:flex w-1/3 sticky top-24 h-fit items-center justify-center">
        {animationData && (
          <Lottie
            animationData={animationData}
            loop
            className="w-80 h-80"
          />
        )}
      </div>
    </div>
  );
}

/* ===================== UI HELPERS ===================== */

function Field({ icon, label, name, value, onChange, placeholder }) {
  return (
    <div>
      <label className="text-sm text-slate-400 mb-1 block">{label}</label>
      <div className="relative">
        {icon && (
          <span className="absolute left-3 top-3 text-slate-400">
            {icon}
          </span>
        )}
        <input
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`w-full ${icon ? "pl-10" : "pl-3"} pr-3 py-2 rounded-lg
            bg-[#0b0f14] border border-yellow-400
            text-slate-200 outline-none`}
        />
      </div>
    </div>
  );
}

function Select({ label, name, value, onChange, options }) {
  return (
    <div>
      <label className="text-sm text-slate-400 mb-1 block">{label}</label>
      <select
        name={name}
        value={value}
        onChange={onChange}
        className="w-full rounded-lg p-2
          bg-[#0b0f14] border border-yellow-400
          text-slate-200 outline-none"
      >
        <option value="">Select</option>
        {options.map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
    </div>
  );
}

function Upload({ label, preview, onUpload, onRemove }) {
  return (
    <div>
      <label className="text-sm text-slate-400 mb-2 block">{label}</label>
      {!preview ? (
        <label className="flex items-center justify-center h-32
          border-2 border-dashed border-yellow-400/30
          rounded-xl cursor-pointer hover:bg-yellow-400/5">
          <FaUpload className="mr-2" /> Upload
          <input
            type="file"
            hidden
            onChange={(e) => onUpload(e.target.files[0])}
          />
        </label>
      ) : (
        <div className="relative w-64">
          <img
            src={preview}
            className="w-full h-36 object-cover rounded-lg border border-yellow-400"
          />
          <button
            onClick={onRemove}
            className="absolute top-2 right-2 bg-black/70 text-white p-1 rounded-full"
          >
            <AiOutlineClose />
          </button>
        </div>
      )}
    </div>
  );
}
