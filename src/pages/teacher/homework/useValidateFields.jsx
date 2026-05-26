import { useState } from "react";

const useValidateFields = () => {
  const [errors, setErrors] = useState({});

  const validate = async ({ initialValue, validateSchema }) => {
    try {
      await validateSchema.validate(initialValue, { abortEarly: false });
      setErrors({});
      return { errors: null, isError: false, value: initialValue };
    } catch (err) {
      const errors = err.inner.reduce((acc, curr) => {
        acc[curr.path] = curr.message;
        return acc;
      }, {});
      setErrors(errors);
      return { errors: errors, isError: true, value: initialValue };
    }
  };

  return {
    errors,
    validate,
  };
};

export const validate = async (initialValue, validateSchema) => {
  try {
    await validateSchema.validate(initialValue, { abortEarly: false });

    return { errors: null, isError: false, value: initialValue };
  } catch (err) {
    const errors = err.inner.reduce((acc, curr) => {
      acc[curr.path] = curr.message;
      return acc;
    }, {});
    return { errors: errors, isError: true, value: initialValue };
  }
};

export default useValidateFields;
