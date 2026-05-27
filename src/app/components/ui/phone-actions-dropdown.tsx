import { Phone, MessageSquare, MessageCircle, Video } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './dropdown-menu';

interface PhoneActionsDropdownProps {
  phoneNumber: string;
  children: React.ReactNode;
}

export function PhoneActionsDropdown({ phoneNumber, children }: PhoneActionsDropdownProps) {
  if (!phoneNumber || phoneNumber === '-') return <>{phoneNumber || '-'}</>;

  // Clean phone number (remove spaces, plus, hyphens for api/url calls)
  const cleanNumber = phoneNumber.replace(/[^\d+]/g, '');
  // For WhatsApp, we want the number without '+' or special characters, but with country code.
  // If no '+' exists and it starts with 10 digits in India, we can prepend country code '91'.
  let whatsappNumber = cleanNumber.replace('+', '');
  if (whatsappNumber.length === 10) {
    whatsappNumber = '91' + whatsappNumber;
  }

  const handleCall = () => {
    window.open(`tel:${cleanNumber}`, '_self');
  };

  const handleSMS = () => {
    window.open(`sms:${cleanNumber}`, '_self');
  };

  const handleWhatsAppMessage = () => {
    window.open(`https://wa.me/${whatsappNumber}`, '_blank');
  };

  const handleWhatsAppCall = () => {
    // There is no standard URL scheme to initiate WhatsApp voice/video calls directly,
    // so we redirect to wa.me chat where the user has immediate access to call buttons.
    window.open(`https://wa.me/${whatsappNumber}`, '_blank');
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <span className="cursor-pointer hover:underline text-indigo-600 dark:text-indigo-400 font-medium inline-flex items-center gap-1">
          {children}
        </span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56 bg-popover border rounded-md shadow-md p-1">
        <DropdownMenuItem onClick={handleCall} className="flex items-center gap-2 px-2 py-1.5 text-sm cursor-pointer rounded-sm outline-hidden">
          <Phone className="h-4 w-4 text-green-500 shrink-0" />
          <span>Call (Phone)</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleSMS} className="flex items-center gap-2 px-2 py-1.5 text-sm cursor-pointer rounded-sm outline-hidden">
          <MessageSquare className="h-4 w-4 text-blue-500 shrink-0" />
          <span>Send SMS Message</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleWhatsAppMessage} className="flex items-center gap-2 px-2 py-1.5 text-sm cursor-pointer rounded-sm outline-hidden">
          <MessageCircle className="h-4 w-4 text-emerald-500 shrink-0" />
          <span>WhatsApp Message</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleWhatsAppCall} className="flex items-center gap-2 px-2 py-1.5 text-sm cursor-pointer rounded-sm outline-hidden">
          <Video className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>WhatsApp Call</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
