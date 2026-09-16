import { toast } from "react-toastify";

const baseOptions = {
  position: "top-right",
  autoClose: 3200,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  theme: "colored",
};

export const notify = {
  success: (message, options = {}) =>
    toast.success(message || "Success", { ...baseOptions, ...options }),

  error: (message, options = {}) =>
    toast.error(message || "Something went wrong", {
      ...baseOptions,
      autoClose: 4200,
      ...options,
    }),

  warning: (message, options = {}) =>
    toast.warning(message || "Please check and try again", {
      ...baseOptions,
      autoClose: 3800,
      ...options,
    }),

  info: (message, options = {}) =>
    toast.info(message || "Info", { ...baseOptions, ...options }),
};

export default notify;
