import { ViewIcon, ViewOffIcon } from "@chakra-ui/icons";
import { Button, Input, InputGroup, InputRightElement } from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { signupAction } from "../../Redux/Auth/Action";
import useShowToast from "../../Redux/useShowToast";

const Signup = () => {
  const dispatch = useDispatch();
  const showToast = useShowToast();
  const { auth } = useSelector((store) => store);
  const [inputs, setInputs] = useState({
    fullName: "",
    username: "",
    email: "",
    password: "",
    reEnterPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showReEnterPassword, setShowReEnterPassword] = useState(false);

  const validateEmail = (email) => {
    return String(email)
      .toLowerCase()
      .match(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      );
  };

  const validateForm = async () => {
    let tempErrors = {};
    if (!inputs.fullName) {
      tempErrors.password = "Fullname must not be blank";
    }

    if (!inputs.username) {
      tempErrors.username = "Username must not be blank";
    } else {
      try {
        const res = await fetch(
          `http://localhost:8080/auth/check-username?username=${inputs.username}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (!res.ok) {
          // Xử lý khi response không ok (403, 500, etc)
          tempErrors.username = "Error checking username";
        } else {
          // Chỉ parse JSON khi response ok
          const data = await res.json();
          if (data.exists) {
            tempErrors.username = data.message;
          }
        }
      } catch (error) {
        console.error("Error checking username:", error);
        tempErrors.username = "Error checking username";
      }
    }

    if (!inputs.email) {
      tempErrors.email = "Email must not be blank";
    } else if (!validateEmail(inputs.email)) {
      tempErrors.email = "Email is invalid";
    }

    if (!inputs.password) {
      tempErrors.password = "Password must not be blank";
    } else if (inputs.password.length < 6) {
      tempErrors.password = "Password must be at least 6 characters";
    }

    if (!inputs.reEnterPassword) {
      tempErrors.reEnterPassword = "Re-enter Password must not be blank";
    }
    else if (inputs.reEnterPassword !== inputs.password) {
      tempErrors.reEnterPassword = "Re-enter Password does not match password";
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0; // trả về true nếu không có lỗi
  };

  const handleSubmit = async (values) => {
    const isValid = await validateForm(); // Thêm await ở đây
    if (isValid) {
      dispatch(signupAction(values, showToast));
    }
  };

  useEffect(() => {
    if (auth.signup?.username) {
      showToast(`Account Created ${auth.signup.username}`, "", "success");
    }
  }, [auth.signup]);

  return (
    <>
      <Input
        placeholder="Email"
        fontSize={14}
        type="email"
        value={inputs.email}
        size={"sm"}
        onChange={(e) => setInputs({ ...inputs, email: e.target.value })}
        isInvalid={errors.email}
      />

      {errors.email && (
        <span style={{ color: "red", fontSize: "12px" }}>{errors.email}</span>
      )}

      <Input
        placeholder="Username"
        fontSize={14}
        type="text"
        value={inputs.username}
        size={"sm"}
        onChange={(e) => setInputs({ ...inputs, username: e.target.value })}
        isInvalid={errors.username}
      />

      {errors.username && (
        <span style={{ color: "red", fontSize: "12px" }}>
          {errors.username}
        </span>
      )}

      <Input
        placeholder="Full Name"
        fontSize={14}
        type="text"
        value={inputs.fullName}
        size={"sm"}
        onChange={(e) => setInputs({ ...inputs, fullName: e.target.value })}
      />

      <InputGroup>
        <Input
          placeholder="Password"
          fontSize={14}
          type={showPassword ? "text" : "password"}
          value={inputs.password}
          size={"sm"}
          onChange={(e) => setInputs({ ...inputs, password: e.target.value })}
          isInvalid={errors.password}
        />
        <InputRightElement>
          <Button
            variant={"ghost"}
            size={"sm"}
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <ViewIcon /> : <ViewOffIcon />}
          </Button>
        </InputRightElement>
      </InputGroup>

      {errors.password && (
        <span style={{ color: "red", fontSize: "12px" }}>
          {errors.password}
        </span>
      )}

      <InputGroup>
        <Input
          placeholder="Re-enter Password"
          fontSize={14}
          type={showReEnterPassword ? "text" : "password"}
          value={inputs.reEnterPassword}
          size={"sm"}
          onChange={(e) =>
            setInputs({ ...inputs, reEnterPassword: e.target.value })
          }
          isInvalid={errors.reEnterPassword}
        />

        <InputRightElement>
          <Button
            variant={"ghost"}
            size={"sm"}
            onClick={() => setShowReEnterPassword(!showReEnterPassword)}
          >
            {showReEnterPassword ? <ViewIcon /> : <ViewOffIcon />}
          </Button>
        </InputRightElement>
      </InputGroup>

      {errors.reEnterPassword && (
        <span style={{ color: "red", fontSize: "12px" }}>
          {errors.reEnterPassword}
        </span>
      )}

      <Button
        w={"full"}
        colorScheme="blue"
        size={"sm"}
        fontSize={14}
        onClick={() => handleSubmit(inputs)}
        isLoading={auth.loading}
        loadingText="Signing up"
      >
        Sign up
      </Button>
    </>
  );
};

export default Signup;
