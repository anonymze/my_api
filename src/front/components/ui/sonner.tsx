import { Toaster as Sonner, ToasterProps } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="light"
      className="toaster group"
      position="top-right"
      closeButton
      richColors
      expand={false}
      duration={4000}
      toastOptions={{
        style: {
          border: "1px solid",
          fontSize: "14px",
          padding: "12px 16px",
        },
        className: "toast",
        classNames: {
          success: "border-green-500 bg-green-500 text-white",
          error: "border-red-500 bg-red-500 text-white",
          info: "border-blue-500 bg-blue-500 text-white",
          warning: "border-yellow-500 bg-yellow-500 text-black",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
