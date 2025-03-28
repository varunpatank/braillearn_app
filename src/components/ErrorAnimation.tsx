import { XCircle } from 'lucide-react';

export function ErrorAnimation() {
  return (
    <div className="flex items-center justify-center">
      <div className="relative">
        <div className="absolute inset-0 animate-ping rounded-full bg-red-400 opacity-25"></div>
        <div className="relative rounded-full bg-red-500 p-2">
          <XCircle className="h-6 w-6 text-white" />
        </div>
      </div>
    </div>
  );
}