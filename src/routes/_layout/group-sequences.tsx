import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Container,
  Heading,
  Text,
  Box,
  Flex,
  EmptyState,
  IconButton as ChakraIconButton,
  Spinner,
} from "@chakra-ui/react";
import { FaPlus, FaArrowLeft } from "react-icons/fa";
import { FiSearch } from "react-icons/fi";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { z } from "zod";

import { SequenceService } from "../../client/services/SequenceService";
import AddSequence from "../../components/Sequences/AddSequence";
import DeleteSequence from "../../components/Sequences/DeleteSequence";
import EditSequence from "../../components/Sequences/EditSequence";
import { Button } from "../../components/ui/button";
import useCustomToast from "../../hooks/useCustomToast";

const groupSequencesSearchSchema = z.object({
  groupId: z.string(),
});

export const Route = createFileRoute("/_layout/group-sequences")({
  component: GroupSequences,
  validateSearch: (search) => groupSequencesSearchSchema.parse(search),
});

function GroupSequences() {
  const navigate = useNavigate({ from: Route.fullPath });
  const { groupId } = Route.useSearch();
  const [isAddingSequence, setIsAddingSequence] = useState(false);
  const { showSuccessToast } = useCustomToast();

  // Fetch group details
  const { data: group, isLoading: isLoadingGroup } = useQuery({
    queryKey: ["sequenceGroup", groupId],
    queryFn: () => SequenceService.readSequenceGroup({ id: groupId }),
  });

  // Fetch sequences for this group
  const { 
    data: sequences, 
    isLoading: isLoadingSequences, 
    isError, 
    error, 
    refetch 
  } = useQuery({
    queryKey: ["sequences", { groupId }],
    queryFn: async () => {
      try {
        console.log("Fetching sequences for group:", groupId);
        const result = await SequenceService.readSequences({ group_id: groupId });
        console.log("Sequences result:", result);
        return result;
      } catch (err) {
        console.error("Error fetching sequences:", err);
        throw err;
      }
    },
  });

  const handleAddSequenceClose = () => {
    setIsAddingSequence(false);
    refetch();
  };

  const goBack = () => {
    navigate({ to: "/sequences" });
  };

  const isLoading = isLoadingGroup || isLoadingSequences;

  return (
    <Container maxW="full">
      <Flex alignItems="center" pt={12} mb={6}>
        <Button 
          variant="ghost" 
          onClick={goBack}
          mr={4}
        >
          Indietro
        </Button>
        <Heading size="lg">
          {isLoadingGroup ? "Caricamento..." : `Sequenze: ${group?.name}`}
        </Heading>
      </Flex>

      <Flex justifyContent="flex-end" mb={6}>
        <Button
          colorScheme="teal"
          onClick={() => {
            // Reset lo stato prima di aprire il dialog
            setIsAddingSequence(false);
            // Poi imposta lo stato a true per aprire il dialog
            setTimeout(() => setIsAddingSequence(true), 0);
          }}
        >
          Aggiungi Sequenza
        </Button>
      </Flex>

      {isLoading ? (
        <Flex justifyContent="center" alignItems="center" height="200px">
          <Spinner size="xl" />
          <Text ml={4}>Caricamento in corso...</Text>
        </Flex>
      ) : isError ? (
        <Box p={4} bg="red.50" color="red.600" borderRadius="md">
          <Text fontWeight="bold">Errore nel caricamento delle sequenze</Text>
          <Text mt={2}>Si è verificato un errore durante il caricamento delle sequenze. Riprova più tardi.</Text>
          <Text mt={2} fontSize="sm" fontFamily="monospace">
            {error instanceof Error ? error.message : "Errore sconosciuto"}
          </Text>
          <Button mt={4} onClick={() => refetch()} size="sm">
            Riprova
          </Button>
        </Box>
      ) : sequences && sequences.length > 0 ? (
        <Box display="flex" flexDirection="column" gap={4}>
          {sequences.map((sequence) => (
            <Box
              key={sequence.id}
              p={4}
              borderWidth="1px"
              borderRadius="md"
              boxShadow="sm"
            >
              <Flex justify="space-between" align="center">
                <Text fontWeight="medium">{sequence.name}</Text>
                <Box display="flex" gap={2}>
                  <EditSequence id={sequence.id} name={sequence.name} />
                  <DeleteSequence id={sequence.id} />
                </Box>
              </Flex>
            </Box>
          ))}
        </Box>
      ) : (
        <EmptyState.Root>
          <EmptyState.Content>
            <EmptyState.Indicator>
              <FiSearch />
            </EmptyState.Indicator>
            <Box textAlign="center" display="flex" flexDirection="column" gap={2}>
              <EmptyState.Title>Nessuna sequenza trovata</EmptyState.Title>
              <EmptyState.Description>
                Aggiungi una nuova sequenza per iniziare
              </EmptyState.Description>
            </Box>
          </EmptyState.Content>
        </EmptyState.Root>
      )}

      {isAddingSequence && (
        <AddSequence
          groupId={groupId}
          onClose={handleAddSequenceClose}
          triggerButton={false}
        />
      )}
    </Container>
  );
}


