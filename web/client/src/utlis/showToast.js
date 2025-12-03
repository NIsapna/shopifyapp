// ✅ Modern App Bridge v4 Toast helper
export const showToast = (toast, message, isError = false) => {
  if (!toast || typeof toast.show !== "function") {
    console.warn("showToast called without valid toast object");
    return;
  }

  toast.show(message, {
    isError,
  });
};
