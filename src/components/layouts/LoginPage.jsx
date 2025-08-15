import React from "react";

import { useEffect, useState } from "react";
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
      setModalError(err?.message || "Failed to save supervisor");
      setShowModal(true);
    }
  };

  return (
    <div className="m-10 flex items-center justify-center gap-10">
      <div className="w-150 h-150 bg-amber-400">
        <img></img>
      </div>
      <Card className="w-fit h-fit bg-white dark:bg-gray-800">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
          <UserCheck className="mr-3 text-blue-600 dark:text-blue-400" />
          Login
        </h1>

        <p className="text-gray-600 dark:text-gray-400 mt-1">
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
