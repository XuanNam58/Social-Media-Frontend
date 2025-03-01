import { Flex, Image, Text } from "@chakra-ui/react";

const GoogleAuth = () => {
  return (
    <Flex alignItems={"center"} justifyContent={"center"} cursor={"pointer"}>
      <Image src="/Images/google.png" w={5} alt="Google logo" />
      <Text>Log in with Google</Text>
    </Flex>
  );
};

export default GoogleAuth;
