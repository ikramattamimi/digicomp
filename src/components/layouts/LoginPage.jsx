import React from "react";

import { useState } from "react";
import { UserCheck } from "lucide-react";
import { Card } from "flowbite-react";
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Label,
  TextInput,
  Select,
} from "flowbite-react";
import AuthService from "../../services/AuthService";
import myImage from "../../assets/logo1.png"

const LoginPage = () => {
  const [currentLoginForm, setCurrentLoginForm] = useState([]);
  const myDomain = "@scprcjt.web.app";

  const handleOnChange = (updated) => {
    setCurrentLoginForm(updated);
  };

  const handleSave = async () => {
    try {
      await AuthService.login(currentLoginForm);
    } catch (err) {
      console.error("Login failed:", err);
    }
  };

  return (
    <div className="m-4 md:m-10 flex flex-col md:flex-row items-center justify-center gap-6 md:gap-10 min-h-screen md:min-h-0">
      <div className="w-32 h-32 md:w-150 md:h-150">
        <img className="object-cover w-full h-full" src={myImage} alt="Logo"></img>
      </div>
      <Card className="w-full max-w-md md:w-fit h-fit bg-white dark:bg-gray-800">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white flex items-center justify-center md:justify-start">
          <UserCheck className="mr-3 text-blue-600 dark:text-blue-400" />
          Login
        </h1>

        <p className="text-gray-600 dark:text-gray-400 mt-1 text-center md:text-left">
          Login dengan akun yang sudah terdaftar
        </p>

        <div>
          <TextInput
            id="email"
            type="email"
            placeholder="Enter NRP"
            onChange={(e) =>
              handleOnChange({
                ...currentLoginForm,
                email: e.target.value + myDomain,
              })
            }
            required
          />
        </div>
        <div>
          <TextInput
            id="password"
            type="password"
            placeholder="Enter password"
            onChange={(e) =>
              handleOnChange({ ...currentLoginForm, password: e.target.value })
            }
            required
          />
        </div>

        <Button onClick={handleSave}>Login</Button>
      </Card>
      
    </div>
  );
};

export default LoginPage;