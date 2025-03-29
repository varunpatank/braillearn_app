import { CheckCircle } from 'lucide-react';

export function SuccessAnimation() {
  return (
    <div className="flex items-center justify-center">
      <div className="relative">
        <div className="absolute inset-0 animate-ping rounded-full bg-blue-700 opacity-25"></div>
        <div className="relative rounded-full bg-blue-700 p-2">
          <CheckCircle className="h-6 w-6 text-white" />
        </div>
      </div>
    </div>
  );
}