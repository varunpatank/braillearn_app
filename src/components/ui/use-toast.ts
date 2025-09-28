import { toast as hotToast } from "react-hot-toast"

interface ToastOptions {
  title?: string
  description?: string
  variant?: "default" | "destructive"
}

export const toast = ({ title, description, variant = "default" }: ToastOptions) => {
  hotToast(description || title || "", {
    duration: 3000,
    className: variant === "destructive" ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800",
  })
}