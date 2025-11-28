import { useState, useRef, useEffect } from "react";
import FormField from "./FormField";
import { type CreateRecordFormData } from "../hooks/useRecordForm";
import { type useVaccineAutocomplete } from "../hooks/useVaccineAutocomplete";

interface RecordFormFieldsProps {
  formData: CreateRecordFormData;
  errors: Partial<Record<keyof CreateRecordFormData, string>>;
  onFieldChange: (
    field: keyof CreateRecordFormData,
    value: string | undefined
  ) => void;
  onRecordTypeChange: (value: string) => void;
}

function RecordFormFields({
  formData,
  errors,
  onFieldChange,
  onRecordTypeChange,
}: RecordFormFieldsProps) {
  const isVaccine = formData.record_type === "vaccine";
  const isAllergy = formData.record_type === "allergy";

  const [isInputFocused, setIsInputFocused] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  const { suggestions, isLoading } = useVaccineAutocomplete(
    formData.name || "",
    isVaccine
  );

  const [showSuggestions, setShowSuggestions] = useState(false);

  // Show suggestions when input is focused and we have a search term
  useEffect(() => {
    if (isInputFocused && formData.name && formData.name.trim().length >= 2) {
      setShowSuggestions(true);
    } else if (!isInputFocused) {
      // Delay hiding to allow clicking on suggestions
      const timer = setTimeout(() => setShowSuggestions(false), 200);
      return () => clearTimeout(timer);
    }
  }, [isInputFocused, formData.name]);

  const handleSuggestionClick = (suggestion: string) => {
    onFieldChange("name", suggestion);
    setShowSuggestions(false);
    setSelectedIndex(-1);
    inputRef.current?.blur();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isVaccine || !showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          handleSuggestionClick(suggestions[selectedIndex]);
        }
        break;
      case "Escape":
        setShowSuggestions(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  const highlightMatch = (text: string, search: string) => {
    if (!search) return text;
    const regex = new RegExp(`(${search})`, "gi");
    const parts = text.split(regex);
    return parts.map((part, index) =>
      regex.test(part) ? (
        <span key={index} className="font-semibold text-blue-600">
          {part}
        </span>
      ) : (
        part
      )
    );
  };

  return (
    <>
      <FormField label="Record Type" error={errors.record_type} required>
        <select
          value={formData.record_type}
          onChange={(e) => onRecordTypeChange(e.target.value)}
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            errors.record_type ? "border-red-500" : "border-gray-300"
          }`}
        >
          <option value="vaccine">Vaccine</option>
          <option value="allergy">Allergy</option>
        </select>
      </FormField>

      <FormField
        label={isVaccine ? "Vaccine Name" : "Allergy Name"}
        error={errors.name}
        required
      >
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={formData.name}
            onChange={(e) => {
              onFieldChange("name", e.target.value);
              setSelectedIndex(-1);
            }}
            onFocus={() => setIsInputFocused(true)}
            onBlur={() => setIsInputFocused(false)}
            onKeyDown={handleKeyDown}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.name ? "border-red-500" : "border-gray-300"
            }`}
            placeholder={
              isVaccine ? "Enter vaccine name" : "Enter allergy name"
            }
            autoComplete="off"
          />

          {isVaccine && showSuggestions && isInputFocused && (
            <div
              ref={suggestionsRef}
              className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto"
            >
              {isLoading ? (
                <div className="px-4 py-2 text-sm text-gray-500">
                  Loading suggestions...
                </div>
              ) : suggestions.length > 0 ? (
                <ul className="py-1">
                  {suggestions.map((suggestion, index) => (
                    <li
                      key={index}
                      onClick={() => handleSuggestionClick(suggestion)}
                      onMouseEnter={() => setSelectedIndex(index)}
                      className={`px-4 py-2 cursor-pointer text-sm ${
                        selectedIndex === index
                          ? "bg-blue-100 text-blue-900"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      {highlightMatch(suggestion, formData.name || "")}
                    </li>
                  ))}
                </ul>
              ) : formData.name && formData.name.trim().length >= 2 ? (
                <div className="px-4 py-2 text-sm text-gray-500">
                  No suggestions found. You can enter a new vaccine name.
                </div>
              ) : null}
            </div>
          )}
        </div>
      </FormField>

      {isVaccine && (
        <FormField label="Date Administered" error={errors.date} required>
          <input
            type="date"
            value={formData.date || ""}
            onChange={(e) => onFieldChange("date", e.target.value)}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.date ? "border-red-500" : "border-gray-300"
            }`}
          />
        </FormField>
      )}

      {isAllergy && (
        <FormField label="Severity" error={errors.severity} required>
          <select
            value={formData.severity || ""}
            onChange={(e) =>
              onFieldChange("severity", e.target.value as "mild" | "severe")
            }
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.severity ? "border-red-500" : "border-gray-300"
            }`}
          >
            <option value="">Select severity</option>
            <option value="mild">Mild</option>
            <option value="severe">Severe</option>
          </select>
        </FormField>
      )}

      <FormField label="Reactions (Optional)" error={errors.reactions}>
        <textarea
          value={formData.reactions || ""}
          onChange={(e) => onFieldChange("reactions", e.target.value)}
          rows={3}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Describe any reactions (e.g., hives, rash, swelling)"
        />
      </FormField>

      {isAllergy && (
        <FormField label="Date (Optional)" error={errors.date}>
          <input
            type="date"
            value={formData.date || ""}
            onChange={(e) => onFieldChange("date", e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </FormField>
      )}
    </>
  );
}

export default RecordFormFields;