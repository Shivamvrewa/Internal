/**
 * Parses author signatures (e.g. [by Shivam] or (Aman)) from standard text columns.
 * Fallbacks to "System" if no author signature is found.
 */
export const parseMetadata = (text: string): { cleanText: string; createdBy: string; receiptUrl?: string } => {
  if (!text) {
    return { cleanText: '', createdBy: 'System', receiptUrl: undefined };
  }
  
  // Extract receipt if present
  const receiptMatch = text.match(/\[receipt:([^\]]+)\]/);
  const receiptUrl = receiptMatch ? receiptMatch[1] : undefined;
  
  // Remove receipt from text before parsing standard signature
  let textWithoutReceipt = text.replace(/\[receipt:[^\]]+\]/g, '').trim();
  
  const match = textWithoutReceipt.match(/(.*?)\s*(?:\[by\s+([^\]]+)\]|\(([^)]+)\))?$/);
  if (match) {
    const cleanText = (match[1] || textWithoutReceipt).trim();
    const createdBy = match[2] || match[3] || 'System';
    return { cleanText, createdBy, receiptUrl };
  }
  
  return { cleanText: textWithoutReceipt.trim(), createdBy: 'System', receiptUrl };
};

/**
 * Appends an author signature and optional receipt to a text string.
 */
export const appendMetadata = (text: string, userName: string, receiptUrl?: string): string => {
  const { cleanText, receiptUrl: existingReceipt } = parseMetadata(text);
  
  const finalReceipt = receiptUrl !== undefined ? receiptUrl : existingReceipt;
  
  let result = cleanText;
  if (finalReceipt) {
    result += ` [receipt:${finalReceipt}]`;
  }
  
  return `${result} [by ${userName}]`;
};

/**
 * Downscales and compresses an image base64 data URL to a lightweight JPEG (max 600x600, 60% quality).
 */
export const compressImage = (base64Str: string, maxWidth = 600, maxHeight = 600): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = base64Str;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;
      
      if (width > height) {
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
      }
      
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/jpeg', 0.6));
    };
    img.onerror = () => {
      resolve(base64Str);
    };
  });
};

/**
 * Formats a date string (ISO, timestamp, simple YYYY-MM-DD, or date-time) to a consistent date and time string.
 * Example output: "25 May 2026, 12:31 PM"
 * If dateStr is empty, null, undefined, or hyphens, returns it as is.
 */
export const formatDateTime = (dateStr: string | null | undefined): string => {
  if (!dateStr || dateStr === '-' || dateStr === 'N/A') return dateStr || '-';
  try {
    let normalized = dateStr;
    // If it's a date-only string (e.g. 2026-05-25), we append a baseline time.
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      normalized = `${dateStr}T12:00:00`;
    }
    const date = new Date(normalized);
    if (isNaN(date.getTime())) return dateStr;
    return date.toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  } catch (e) {
    return dateStr;
  }
};

/**
 * Returns the current local date-time string in YYYY-MM-DDTHH:MM format.
 */
export const getCurrentLocalDateTimeString = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

/**
 * Safely normalizes any date string (ISO or date-only) to a local YYYY-MM-DDTHH:MM string compatible with datetime-local input.
 */
export const getLocalDateTimeString = (dateStr: string | null | undefined): string => {
  if (!dateStr || dateStr === '-' || dateStr === 'N/A') return getCurrentLocalDateTimeString();
  if (dateStr.includes('T')) return dateStr.substring(0, 16);
  return `${dateStr}T12:00`;
};

/**
 * Calculates subscription end date given a start date and plan name, excluding Sundays.
 * Week plans = 6 active days
 * Month plans = 24 active days
 * Others = 30 active days
 */
export const calculateSubscriptionEndDate = (startDateStr: string | null | undefined, planName: string | null | undefined): string => {
  if (!startDateStr) return '';
  const plan = planName || '';
  
  let activeDays = 30; // default for Others
  if (plan.toLowerCase().includes('week')) {
    activeDays = 6;
  } else if (plan.toLowerCase().includes('month')) {
    activeDays = 24;
  }
  
  const start = new Date(startDateStr);
  let daysAdded = 0;
  const current = new Date(start);
  
  // If start date itself is a Sunday, skip to next Monday
  if (current.getDay() === 0) {
    current.setDate(current.getDate() + 1);
  }
  
  // Count delivery days excluding Sundays
  while (daysAdded < activeDays - 1) {
    current.setDate(current.getDate() + 1);
    if (current.getDay() !== 0) { // Skip Sunday
      daysAdded++;
    }
  }
  
  const yyyy = current.getFullYear();
  const mm = String(current.getMonth() + 1).padStart(2, '0');
  const dd = String(current.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

/**
 * Parses subscription dates embedded in customer notes if present, e.g. [subscription: 2026-05-27 to 2026-06-23].
 */
export const parseSubscriptionDates = (notes: string | null | undefined): { cleanNotes: string; startDate: string; endDate: string } => {
  if (!notes) {
    return { cleanNotes: '', startDate: '', endDate: '' };
  }
  
  const match = notes.match(/\[subscription:\s*([^\s]+)\s+to\s+([^\s]+)\]/);
  if (match) {
    const startDate = match[1];
    const endDate = match[2];
    const cleanNotes = notes.replace(/\[subscription:\s*[^\s]+\s+to\s+[^\s]+\]/g, '').trim();
    return { cleanNotes, startDate, endDate };
  }
  
  return { cleanNotes: notes.trim(), startDate: '', endDate: '' };
};

/**
 * Embeds subscription dates into customer notes as [subscription: YYYY-MM-DD to YYYY-MM-DD].
 */
export const serializeSubscriptionDates = (notes: string | null | undefined, startDate: string, endDate: string): string => {
  const { cleanNotes } = parseSubscriptionDates(notes);
  const subscriptionTag = `[subscription: ${startDate} to ${endDate}]`;
  if (!cleanNotes) return subscriptionTag;
  return `${subscriptionTag} ${cleanNotes}`;
};

/**
 * Calculates active delivery days left from today until subscription end date (excluding Sundays).
 * Returns positive number of days left, or negative number of calendar days overdue if end date has passed.
 */
export const calculateDaysRemaining = (endDateStr: string | null | undefined): number => {
  if (!endDateStr) return 30;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const end = new Date(endDateStr);
  end.setHours(0, 0, 0, 0);
  
  if (today.getTime() > end.getTime()) {
    const diffTime = today.getTime() - end.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return -diffDays;
  }
  
  let daysLeft = 0;
  const current = new Date(today);
  
  while (current.getTime() <= end.getTime()) {
    if (current.getDay() !== 0) { // Skip Sundays
      daysLeft++;
    }
    current.setDate(current.getDate() + 1);
  }
  
  return daysLeft;
};
