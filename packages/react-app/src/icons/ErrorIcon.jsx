import { Flex } from '@chakra-ui/react';
import React from 'react';

export const ErrorIcon = ({ size, ...props }) => {
  const borderWidth = size * 0.25;
  return (
    <Flex
      h={size}
      w={size}
      minW={size}
      minH={size}
      align="center"
      justify="center"
      border={`${borderWidth}px solid`}
      borderRadius="50%"
      borderColor="currentColor"
      color="currentColor"
      {...props}
    >
      <svg width="55%" height="55%" viewBox="0 0 18 18" fill="none">
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M17.2923 17.2923C16.9011 17.6835 16.2669 17.6835 15.8757 17.2923L8.79285 10.2094L1.70996 17.2923C1.31878 17.6835 0.684559 17.6835 0.293382 17.2923C-0.0977942 16.9011 -0.0977941 16.2669 0.293383 15.8757L7.37627 8.79285L0.293383 1.70996C-0.0977941 1.31878 -0.0977942 0.684559 0.293382 0.293382C0.684559 -0.0977943 1.31878 -0.097794 1.70996 0.293383L8.79285 7.37627L15.8757 0.293407C16.2669 -0.09777 16.9011 -0.0977703 17.2923 0.293406C17.6835 0.684583 17.6835 1.31881 17.2923 1.70998L10.2094 8.79285L17.2923 15.8757C17.6835 16.2669 17.6835 16.9011 17.2923 17.2923Z"
          fill="currentColor"
        />
      </svg>
    </Flex>
  );
};
