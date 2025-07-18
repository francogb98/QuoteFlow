"use client";

import React, { useState } from "react";
import { UseFormRegisterReturn } from "react-hook-form";
import { IoEyeOffOutline, IoEyeOutline } from "react-icons/io5";

interface InputFieldProps {
  type: string;
  id: string;
  label: string;
  register?: UseFormRegisterReturn;
  required?: boolean;
  error?: string;
}

export const InputField = ({
  type,
  id,
  label,
  register,
  required = true,
  error,
}: InputFieldProps) => {
  const [showPassword, setShowPassword] = useState(false);

  const isPasswordField = type === "password";
  const inputType = isPasswordField && showPassword ? "text" : type;

  return (
    <div className="relative z-0 w-full mb-5 group">
      <input
        type={inputType}
        id={id}
        {...register}
        className={`block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 ${
          error ? "border-red-500" : "border-gray-300"
        } appearance-none dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer`}
      />
      <label
        htmlFor={id}
        className={`peer-focus:font-medium absolute text-sm ${
          error ? "text-red-500" : "text-gray-500 dark:text-gray-400"
        } duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6`}
      >
        {label}
        {required && <span className="text-red-500">*</span>}
      </label>

      {isPasswordField && (
        <button
          type="button"
          className="absolute right-0 top-3 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
          onClick={() => setShowPassword(!showPassword)}
        >
          {showPassword ? (
            <IoEyeOffOutline size={20} />
          ) : (
            <IoEyeOutline size={20} />
          )}
        </button>
      )}

      {error && (
        <p className="mt-1 text-xs text-red-500 dark:text-red-400">{error}</p>
      )}
    </div>
  );
};
