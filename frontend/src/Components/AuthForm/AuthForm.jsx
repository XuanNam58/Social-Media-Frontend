import { Box, Flex, Image, Text, VStack } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import Login from "./Login";
import Signup from "./Signup";
import GoogleAuth from "./GoogleAuth";
import { useSelector } from "react-redux";

const AuthForm = () => {
  const [isLogin, setIsLogin] = useState(true);
  const { auth } = useSelector((store) => store);

  useEffect(()=>{
    if (auth.signup?.username) {
      setIsLogin(true);
    }
  }, [auth.signup]);

  return (
    <>
      <Box
        border={"1px solid gray"}
        borderRadius={4}
        padding={5}
        w={{ base: "90%", sm: "300px" }}
      >
        <VStack spacing={4}>
          <Image src="/Images/logo.png" h={24} cursor={"pointer"} alt="logo" />
          {isLogin ? <Login /> : <Signup />}

          {/* ------------------------- OR ------------------------- */}
          <Flex
            alignItems={"center"}
            justifyContent={"center"}
            my={4}
            gap={1}
            w={"full"}
          >
            <Box flex={2} h={"1px"} bg={"gray.400"} />
            <Text mx={1} color={"black"}>
              OR
            </Text>
            <Box flex={2} h={"1px"} bg={"gray.400"} />
          </Flex>

          <GoogleAuth />
        </VStack>
      </Box>

      <Box
        border={"1px solid gray"}
        borderRadius={4}
        padding={5}
        w={{ base: "90%", sm: "300px" }}
      >
        <Flex alignItems={"center"} justifyContent={"center"}>
          <Box mx={2} fontSize={14}>
            {isLogin ? "Don't have an account" : "Already have an account"}
          </Box>
          <Box
            onClick={() => setIsLogin(!isLogin)}
            color={"blue.500"}
            cursor={"pointer"}
          >
            {isLogin ? "Sign up" : "Log in"}
          </Box>
        </Flex>
      </Box>
    </>
  );
};

export default AuthForm;
