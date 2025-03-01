import { Box, Container, Flex, Image, VStack } from "@chakra-ui/react";
import AuthForm from "../../Components/AuthForm/AuthForm";

const AuthPage = () => {
  return (
    <Flex minH={"100vh"} justifyContent={"center"} alignItems={"center"} px={4}>
      <Container maxW={"container.md"} padding={0}>
        <Flex justifyContent={"center"} alignItems={"center"} gap={10}>
          {/* Left hand-side */}
          <Box display={{ base: "none", md: "block" }}>
            <Image src="/Images/smartphone-with-social-media.png" h={500} alt="logo img" />
          </Box>

          {/* Right hand-side */}
          <VStack spacing={4} align={"stretch"}>
            <AuthForm />
            <Box textAlign={"center"}>Get the app.</Box>
            <Flex gap={5} justifyContent={"center"}>
              <Image
                src="/Images/playstore.png"
                h={"10"}
                alt="Playstore logo"
              ></Image>
              <Image
                src="/Images/microsoft.png"
                h={"10"}
                alt="Microsoft logo"
              ></Image>
            </Flex>
          </VStack>
        </Flex>
      </Container>
    </Flex>
  );
};

export default AuthPage;
