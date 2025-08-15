import { useState, useEffect } from "react";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface UsernameAvailabilityCheckerProps {
  username: string;
  onAvailabilityChange: (available: boolean) => void;
}

export default function UsernameAvailabilityChecker({ username, onAvailabilityChange }: UsernameAvailabilityCheckerProps) {
  const [isChecking, setIsChecking] = useState(false);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [checkTimeout, setCheckTimeout] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Clear previous timeout
    if (checkTimeout) {
      clearTimeout(checkTimeout);
    }

    // Reset state if username is empty
    if (!username || username.trim() === '') {
      setIsAvailable(null);
      setIsChecking(false);
      onAvailabilityChange(true); // Empty username is considered available (will be auto-generated)
      return;
    }

    // Set a delay before checking to avoid too many API calls
    const timeout = setTimeout(async () => {
      setIsChecking(true);
      try {
        const response = await fetch(`/api/auth/check-username?username=${encodeURIComponent(username)}`);
        const data = await response.json();
        const available = data.available;
        setIsAvailable(available);
        onAvailabilityChange(available);
      } catch (error) {
        console.error('Error checking username availability:', error);
        setIsAvailable(false);
        onAvailabilityChange(false);
      } finally {
        setIsChecking(false);
      }
    }, 500); // 500ms delay

    setCheckTimeout(timeout);

    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [username, onAvailabilityChange]);

  if (!username || username.trim() === '') {
    return null;
  }

  return (
    <div className="flex items-center mt-1 text-xs">
      {isChecking ? (
        <div className="flex items-center text-gray-500">
          <Loader2 className="h-3 w-3 animate-spin mr-1" />
          <span>Checking availability...</span>
        </div>
      ) : isAvailable === true ? (
        <div className="flex items-center text-green-600">
          <CheckCircle className="h-3 w-3 mr-1" />
          <span>Username available</span>
        </div>
      ) : isAvailable === false ? (
        <div className="flex items-center text-red-600">
          <XCircle className="h-3 w-3 mr-1" />
          <span>Username not available</span>
        </div>
      ) : null}
    </div>
  );
}