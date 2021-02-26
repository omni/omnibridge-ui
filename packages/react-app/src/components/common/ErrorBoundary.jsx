import { Flex, Text } from '@chakra-ui/react';
import { logError } from 'lib/helpers';
import React from 'react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    if (error) {
      return { hasError: true };
    }
    return { hasError: false };
  }

  componentDidCatch(error, errorInfo) {
    logError({ error, errorInfo });
  }

  render() {
    const { hasError } = this.state;
    const { children } = this.props;
    if (hasError) {
      return (
        <Flex
          justify="center"
          align="center"
          direction="column"
          w="100%"
          minH="100vh"
        >
          <Text fontSize="lg"> Something went wrong </Text>
          <Text> Please check console for error log </Text>
        </Flex>
      );
    }

    return children;
  }
}
