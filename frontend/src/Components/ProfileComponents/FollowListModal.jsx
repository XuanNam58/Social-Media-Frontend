"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
  VStack,
  Divider,
} from "@chakra-ui/react";
import { SearchIcon } from "@chakra-ui/icons";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getAuth } from "firebase/auth";
import {
  getFollowerListAction,
  getFollowingListAction,
} from "../../Redux/User/Action";

export default function FollowListModal({ isOpen, onClose, title, userId }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState([]);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { page, hasMore, followerList, followingList } = useSelector(
    (store) => store.user
  );
  const observer = useRef();

  // Get token
  const auth = getAuth();
  const [token, setToken] = useState(null);

  useEffect(() => {
    const getToken = async () => {
      if (auth.currentUser) {
        const token = await auth.currentUser.getIdToken();
        setToken(token);
      }
    };
    getToken();
  }, [auth.currentUser]);

  // Reset users and load initial data when modal opens or title changes
  useEffect(() => {
    if (isOpen) {
      setUsers([]);
      setSearchQuery("");
      if (token) {
        dispatch(
          title === "Followers"
            ? getFollowerListAction({ token, followedId: userId, page: 1, size: 5 })
            : getFollowingListAction({ token, followerId: userId, page: 1, size: 5 })
        );
      }
    }
  }, [isOpen, title, token, userId, dispatch]);

  // Update users based on the relevant list
  useEffect(() => {
    const newData = title === "Followers" ? followerList.result : followingList.result;
    if (newData && Array.isArray(newData) && newData.length > 0) {
      setUsers((prevUsers) => {
        const existingUids = new Set(prevUsers.map((user) => user.uid));
        const uniqueNewData = newData.filter((user) => !existingUids.has(user.uid));
        return [...prevUsers, ...uniqueNewData];
      });
    }
  }, [title === "Followers" ? followerList.result : followingList.result, title]);

  // Load more users
  const loadMoreUsers = useCallback(() => {
    if (hasMore && token && isOpen) {
      if (title === "Followers") {
        dispatch(
          getFollowerListAction({
            token,
            followedId: userId,
            page: page + 1,
            size: 5,
          })
        );
      } else if (title === "Following") {
        dispatch(
          getFollowingListAction({
            token,
            followerId: userId,
            page: page + 1,
            size: 5,
          })
        );
      }
    }
  }, [dispatch, hasMore, token, title, page, userId, isOpen]);

  // Observe the last element for infinite scroll
  const lastUserElementRef = useCallback(
    (node) => {
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore && isOpen) {
          loadMoreUsers();
        }
      });
      if (node) observer.current.observe(node);
    },
    [hasMore, loadMoreUsers, isOpen]
  );

  const handleUserClick = (username) => {
    if (username) {
      navigate(`/${username}`);
      onClose();
    }
  };

  // Filter users based on search query
  const filteredUsers = useMemo(() => {
    return users.filter(
      (user) =>
        user.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.fullName?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [users, searchQuery]);

  if (!isOpen) return null;

  return (
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
            {filteredUsers.length === 0 ? (
              <Text textAlign="center" py={4} color="gray.500">
                No {title.toLowerCase()} found
              </Text>
            ) : (
              filteredUsers.map((userItem, index) => {
                const isLastElement = filteredUsers.length === index + 1;
                return (
                  <Flex
                    key={userItem.uid}
                    p={4}
                    alignItems="center"
                    justifyContent="space-between"
                    onClick={() => handleUserClick(userItem.username)}
                    cursor="pointer"
                    _hover={{ bg: "gray.50" }}
                    ref={isLastElement ? lastUserElementRef : null}
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
                  </Flex>
                );
              })
            )}
            {hasMore && (
              <Text textAlign="center" py={2} color="gray.500">
                Loading more...
              </Text>
            )}
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}