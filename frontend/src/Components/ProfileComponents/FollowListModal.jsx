"use client";

import { useCallback, useEffect, useRef, useState } from "react";
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
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getAuth } from "firebase/auth";
import {
  getFollowerIdsAction,
  getFollowerListAction,
  getFollowingIdsAction,
  getFollowingListAction,
} from "../../Redux/User/Action";

export default function FollowListModal({ isOpen, onClose, title, userId }) {
  const [searchQuery, setSearchQuery] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { findUsersByIds, page, hasMore, followerIds, followingIds } =
    useSelector((store) => store.user);
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

  // Hàm tải thêm người dùng
  const loadMoreUsers = useCallback(() => {
    if (hasMore) {
      if (title === "Followers") {
        dispatch(
          getFollowerIdsAction({
            token,
            followedId: userId,
            page: page + 1,
            size: 5,
          })
        ).then(() => {
          const newIds = followerIds.result;
          dispatch(
            getFollowerListAction({
              token,
              userIds: newIds,
              type: "follower-list",
            })
          );
        });
      } else if (title === "Following") {
        dispatch(
          getFollowingIdsAction({
            token,
            followerId: userId,
            page: page + 1,
            size: 5,
          })
        )
          .then((action) => {
            console.log("FollowingIds action:", action);
            console.log("FollowingIds from store:", followingIds);
            const newIds = followingIds?.result || [];
            console.log("New following ids:", newIds);

            console.log("Dispatching getFollowingListAction");
            dispatch(
              getFollowingListAction({
                token,
                userIds: newIds,
                type: "following-list",
              })
            );
          })
          .catch((error) => {
            console.error("Error in following chain:", error);
          });
      }
    }
  }, [
    dispatch,
    hasMore,
    token,
    title,
    page,
    userId,
    followerIds,
    followingIds,
  ]);

  // Theo dõi phần tử cuối cùng
  const lastUserElementRef = useCallback(
    (node) => {
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          loadMoreUsers();
        }
      });
      if (node) observer.current.observe(node);
    },
    [hasMore, loadMoreUsers]
  );
  //   const { user } = useSelector((store) => store);

  const handleUserClick = (username) => {
    if (username) {
      navigate(`/${username}`);
      onClose(); // Đóng modal sau khi điều hướng
    }
  };

  if (!isOpen) return null;

  // Filter followers based on search query
  const filteredFollowers = (findUsersByIds.result || []).filter(
    (user) =>
      user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.fullName.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
            {filteredFollowers.map((userItem, index) => {
              const isLastElement = filteredFollowers.length === index + 1;
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
            })}
            {hasMore && (
              <Text textAlign="center" py={2}>
                Loading more...
              </Text>
            )}
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
