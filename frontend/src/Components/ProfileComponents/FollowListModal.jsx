"use client";

import { useState } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  CloseButton,
  Input,
  InputGroup,
  InputLeftElement,
  Avatar,
  Box,
  Flex,
  Text,
  Button,
  VStack,
  Divider,
  useDisclosure,
} from "@chakra-ui/react";
import { SearchIcon } from "@chakra-ui/icons";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

export default function FollowListModal({ isOpen, onClose, title, users }) {
  const [searchQuery, setSearchQuery] = useState("");
  //   const { user } = useSelector((store) => store);
  const navigate = useNavigate();

  const handleUserClick = (username) => {
    if (username) {
      navigate(`/${username}`);
      onClose(); // Đóng modal sau khi điều hướng
    }
  };

  if (!isOpen) return null;

  // Filter followers based on search query
  const filteredFollowers = users.filter(
    (user) =>
      user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.fullName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} isCentered size="sm">
        <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(5px)" />
        <ModalContent borderRadius="md" maxH="500px">
          <ModalHeader
            borderBottomWidth="1px"
            py={3}
            display="flex"
            alignItems="center"
            justifyContent="space-between"
          >
            <Text fontSize="lg" fontWeight="bold">
              {title}
            </Text>
            <CloseButton onClick={onClose} />
          </ModalHeader>

          <Box px={4} py={3}>
            <InputGroup>
              <InputLeftElement pointerEvents="none">
                <SearchIcon color="gray.400" />
              </InputLeftElement>
              <Input
                placeholder="Search"
                variant="filled"
                bg="gray.100"
                _focus={{ bg: "gray.100" }}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                borderRadius="md"
              />
            </InputGroup>
          </Box>

          <ModalBody p={0} overflowY="auto" maxH="350px">
            <VStack spacing={0} align="stretch" divider={<Divider />}>
              {filteredFollowers.map((userItem) => (
                <Flex
                  key={userItem.uid}
                  p={4}
                  alignItems="center"
                  justifyContent="space-between"
                  onClick={()=>handleUserClick(userItem.username)}
                  cursor="pointer"
                  _hover={{ bg: "gray.50" }}
                >
                  <Flex alignItems="center">
                    <Avatar
                      src={userItem.profilePicURL}
                      name={userItem.fullName}
                      size="md"
                      mr={3}
                    />
                    <Box>
                      <Text fontWeight="medium">{userItem.username}</Text>
                      <Text fontSize="sm" color="gray.500">
                        {userItem.fullName}
                      </Text>
                    </Box>
                  </Flex>
                  {/* <Button
                    colorScheme="blue"
                    size="sm"
                    borderRadius="full"
                    px={6}
                  >
                   Follow
                  </Button> */}
                </Flex>
              ))}
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
}
