import { Button, Flex, HStack } from '@chakra-ui/react';
import { LeftIcon } from 'icons/LeftIcon';
import { RightIcon } from 'icons/RightIcon';
import React, { useEffect } from 'react';
import { useHistory } from 'react-router-dom';

const getDisplayPages = (total, current) => {
  if (total === current) return [current - 2, current - 1, current];
  if (current === 1) return [current, current + 1, current + 2];
  return [current - 1, current, current + 1];
};

export const HistoryPagination = ({ numPages, currentPage }) => {
  const history = useHistory();

  useEffect(() => {
    const unlisten = history.listen(() => {
      window.scrollTo({ top: 0, left: 0 });
    });
    return () => {
      unlisten();
    };
  }, [history]);

  const onClick = page => {
    history.push(`/history?page=${page}`);
  };

  const displayPages = getDisplayPages(numPages, currentPage);

  return (
    <Flex
      w="100%"
      py={{ base: 4, sm: 8 }}
      mb={4}
      align="center"
      justify={{ base: 'center', lg: 'flex-end' }}
      fontSize="sm"
    >
      <HStack spacing={4}>
        <LeftIcon
          boxSize={6}
          color="grey"
          _hover={{ color: 'blue.500' }}
          onClick={() => onClick(currentPage - 1)}
          cursor={currentPage > 1 ? 'pointer' : 'not-allowed'}
        />
        {displayPages.map(
          page =>
            page >= 1 &&
            page <= numPages && (
              <Button
                key={page.toString()}
                background={currentPage === page ? 'blue.500' : 'grey'}
                _hover={{ background: 'blue.500' }}
                color="white"
                onClick={() => onClick(page)}
                size="sm"
              >
                {page}
              </Button>
            ),
        )}
        <RightIcon
          boxSize={6}
          color="grey"
          _hover={{ color: 'blue.500' }}
          onClick={() => onClick(currentPage + 1)}
          cursor={currentPage < numPages ? 'pointer' : 'not-allowed'}
        />
      </HStack>
    </Flex>
  );
};
