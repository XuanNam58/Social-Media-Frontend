import { Button, Input } from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { loginAction } from "../../Redux/Auth/Action";
import useShowToast from "../../Redux/useShowToast";
import { getUserProfileAction } from "../../Redux/User/Action";

const Login = () => {
  const [inputs, setInputs] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({});

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const showToast = useShowToast();
  const { user } = useSelector((store) => store);
  const { auth } = useSelector((store) => store);
  const token = localStorage.getItem("token");

  const validateEmail = (email) => {
    return String(email)
      .toLowerCase()
      .match(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      );
  };

  const validateForm = () => {
    let tempErrors = {};
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

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0; // trả về true nếu không có lỗi
  };

  const handleSubmit = (values, actions) => {
    if (validateForm()) {
      dispatch(loginAction(values, showToast));
    }
    // actions.isSubmitting(false);
  };

  useEffect(() => {
    if (token) dispatch(getUserProfileAction(token));
  }, [token]);

  useEffect(() => {
    if (user.reqUser?.username) {
      navigate(`/${user.reqUser?.username}`);
    }
  }, [token, user.reqUser]);

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
        placeholder="Password"
        fontSize={14}
        type="password"
        value={inputs.password}
        size={"sm"}
        onChange={(e) => setInputs({ ...inputs, password: e.target.value })}
        isInvalid={errors.password}
      />
      {errors.password && (
        <span style={{ color: "red", fontSize: "12px" }}>
          {errors.password}
        </span>
      )}

      <Button
        w={"full"}
        colorScheme="blue"
        size={"sm"}
        fontSize={14}
        onClick={() => handleSubmit(inputs)}
        isLoading={auth.loading}
        loadingText="Logging in"
      >
        Log in
      </Button>
    </>
  );
};

export default Login;
