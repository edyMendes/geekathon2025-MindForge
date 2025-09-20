import { useState, useEffect, useRef } from "react";
import { Save, Folder, AlertCircle, CheckCircle } from "lucide-react";
import Modal from "./Modal.jsx";

export default function ProfileNameModal({ 
  isOpen, 
  onClose, 
  onSave, 
  title = "Save Profile",
  placeholder = "Enter profile name...",
  existingProfiles = [],
  type = "default"
}) {
  const [profileName, setProfileName] = useState("");
  const [error, setError] = useState("");
  const [isValid, setIsValid] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
      setProfileName("");
      setError("");
      setIsValid(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (profileName.trim()) {
      const trimmedName = profileName.trim();
      const isDuplicate = existingProfiles.some(profile => 
        profile.toLowerCase() === trimmedName.toLowerCase()
      );
      
      if (isDuplicate) {
        setError("A profile with this name already exists");
        setIsValid(false);
      } else if (trimmedName.length < 2) {
        setError("Profile name must be at least 2 characters");
        setIsValid(false);
      } else if (trimmedName.length > 50) {
        setError("Profile name must be less than 50 characters");
        setIsValid(false);
      } else {
        setError("");
        setIsValid(true);
      }
    } else {
      setError("");
      setIsValid(false);
    }
  }, [profileName, existingProfiles]);

  const handleSave = () => {
    if (isValid) {
      onSave(profileName.trim());
      onClose();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && isValid) {
      handleSave();
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  const getSuggestions = () => {
    if (!profileName.trim()) return [];
    
    const suggestions = [
      `${new Date().toLocaleDateString()} - ${type}`,
      `${type} - ${new Date().getFullYear()}`,
      `My ${type} Profile`,
      `${type} - Week ${Math.ceil(new Date().getDate() / 7)}`
    ];
    
    return suggestions.filter(suggestion => 
      suggestion.toLowerCase().includes(profileName.toLowerCase()) &&
      !existingProfiles.some(profile => 
        profile.toLowerCase() === suggestion.toLowerCase()
      )
    ).slice(0, 3);
  };

  const suggestions = getSuggestions();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      type="info"
      size="md"
    >
      <div className="space-y-4">
        {/* Input Section */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Profile Name
          </label>
          <div className="relative">
            <input
              ref={inputRef}
              type="text"
              value={profileName}
              onChange={(e) => setProfileName(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              className={`w-full px-4 py-3 border rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 transition-colors duration-200 ${
                error 
                  ? 'border-red-300 dark:border-red-600 focus:border-red-500 focus:ring-red-500' 
                  : isValid 
                    ? 'border-green-300 dark:border-green-600 focus:border-green-500 focus:ring-green-500'
                    : 'border-slate-300 dark:border-slate-600 focus:border-emerald-500 focus:ring-emerald-500'
              } focus:ring-2 focus:ring-opacity-50 outline-none`}
            />
            
            {isValid && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <CheckCircle className="w-5 h-5 text-green-500" />
              </div>
            )}
          </div>
          
          {error && (
            <div className="mt-2 flex items-center space-x-2 text-red-600 dark:text-red-400">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm">{error}</span>
            </div>
          )}
        </div>

        {/* Suggestions */}
        {suggestions.length > 0 && (
          <div>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">Suggestions:</p>
            <div className="space-y-1">
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => setProfileName(suggestion)}
                  className="w-full text-left px-3 py-2 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors duration-200"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Existing Profiles */}
        {existingProfiles.length > 0 && (
          <div>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">Existing profiles:</p>
            <div className="max-h-32 overflow-y-auto space-y-1">
              {existingProfiles.slice(0, 5).map((profile, index) => (
                <div
                  key={index}
                  className="px-3 py-1 text-sm text-slate-500 dark:text-slate-500 bg-slate-50 dark:bg-slate-700 rounded"
                >
                  {profile}
                </div>
              ))}
              {existingProfiles.length > 5 && (
                <div className="px-3 py-1 text-xs text-slate-400 dark:text-slate-600">
                  ... and {existingProfiles.length - 5} more
                </div>
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-200 dark:border-slate-700">
          <button
            onClick={onClose}
            className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors duration-200"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!isValid}
            className={`px-6 py-2 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2 ${
              isValid
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg hover:shadow-emerald-500/25'
                : 'bg-slate-300 dark:bg-slate-600 text-slate-500 dark:text-slate-400 cursor-not-allowed'
            }`}
          >
            <Save className="w-4 h-4" />
            <span>Save Profile</span>
          </button>
        </div>
      </div>
    </Modal>
  );
}
