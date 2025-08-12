import { useMemo } from 'react';

/**
 * Custom hook to manage React Query state with consistent error handling
 * @param {object} queryResult - React Query result object
 * @returns {object} Processed state with consistent structure
 */
export const useQueryState = (queryResult) => {
  return useMemo(() => {
    const {
      data,
      error,
      isLoading,
      isFetching,
      isError,
      isSuccess,
      refetch,
      ...rest
    } = queryResult;

    // Process error message
    const errorMessage = error?.response?.data?.message || 
                        error?.message || 
                        'An unexpected error occurred';

    // Determine loading state
    const loading = isLoading || isFetching;

    // Determine if we have data
    const hasData = isSuccess && data !== undefined;

    return {
      data,
      error: isError ? errorMessage : null,
      loading,
      isError,
      isSuccess,
      hasData,
      refetch,
      ...rest
    };
  }, [queryResult]);
};

/**
 * Custom hook to manage multiple React Query states
 * @param {object} queries - Object containing multiple query results
 * @returns {object} Combined state with loading and error handling
 */
export const useMultipleQueryState = (queries) => {
  return useMemo(() => {
    const queryStates = Object.entries(queries).reduce((acc, [key, query]) => {
      acc[key] = useQueryState(query);
      return acc;
    }, {});

    // Determine overall loading state
    const loading = Object.values(queryStates).some(state => state.loading);

    // Collect all errors
    const errors = Object.values(queryStates)
      .filter(state => state.error)
      .map(state => state.error);

    // Determine if any query has data
    const hasData = Object.values(queryStates).some(state => state.hasData);

    // Determine overall success state
    const isSuccess = Object.values(queryStates).every(state => state.isSuccess);

    return {
      ...queryStates,
      loading,
      errors,
      hasErrors: errors.length > 0,
      hasData,
      isSuccess,
    };
  }, [queries]);
};