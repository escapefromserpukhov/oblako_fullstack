export const bytesToMegaBytes = (value) => {
  try {
    return (parseInt(value, 10) / 1048576).toFixed(2);
  } catch {
    return value;
  }
};

export const handleResponse = async (fn, { rejectWithValue }) => {
  let response;
  try {
    response = await fn();
    if ("errors" in response) {
      throw new Error(JSON.stringify(response?.errors));
    }
    return response;
  } catch (e) {
    return rejectWithValue(response?.errors || e);
  }
};
